import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { load, CheerioAPI } from 'cheerio';
import { stockPrice } from '../stockPrice.model';
import * as iconv from 'iconv-lite';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class CrawlerService {
  constructor(
    private kafkaService: KafkaService,
  ) {}

  private readonly logger = new Logger(CrawlerService.name);

  async fetchStockData(code) {
    const url = `https://polling.finance.naver.com/api/realtime?query=SERVICE_ITEM:${code}`;
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'yeti',
      },
    });
    const data = iconv.decode(Buffer.from(response.data), 'euc-kr');
    const result = JSON.parse(data).result;
    const stockData = result.areas[0].datas[0];
  
    const isNegative = stockData.rf === '5';
  
    return {
      code,
      companyName: stockData.nm,
      currentPrice: stockData.nv,
      previousPriceDifference: isNegative ? -stockData.cv : stockData.cv,
      diffRate: isNegative ? -stockData.cr : stockData.cr,
      tradeVolume: stockData.aq,
      marketCapBillion: null, // 임시로 null 값 할당
    };
  }  

  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: 'crawlAndSaveToDB',
    timeZone: 'Asia/Seoul',
  })
  async crawlAndSaveToDB() {
    const now = new Date();
    const day = now.getDay();
    const startHour = 9;
    const endHour = 15;
    const endMinute = 30;
  
    // 주말이 아닌지 확인합니다.
    const isWeekday = day > 0 && day < 6;
  
    const isAfterStartTime = now.getHours() > startHour || (now.getHours() === startHour && now.getMinutes() >= 0);
    const isBeforeEndTime = now.getHours() < endHour || (now.getHours() === endHour && now.getMinutes() <= endMinute);
    
    // 주말이 아니고 시간이 지정된 범위 내에 있으면 크롤링을 진행합니다.
    if (isWeekday && isAfterStartTime && isBeforeEndTime) {
      for (let pageNum = 1; pageNum <= 20; pageNum++) {
        const url = `https://finance.naver.com/sise/entryJongmok.naver?&page=${pageNum}`;
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'yeti',
          },
        });
        const $: CheerioAPI = load(response.data);
        const rows = $('table.type_1 tbody tr');

        // 시작 인덱스와 종료 인덱스 지정
        const startRowIndex = 2; // 0-indexed, 세 번째 행
        const endRowIndex = 9; // 0-indexed, 열 번째 행

        for (let i = startRowIndex; i <= endRowIndex; i++) {
          const row = $(rows[i]).find('td');
          if (row.length === 0) continue;

          const code = $(row.find('a')[0]).attr('href').split('=')[1];
          const marketCapBillion = parseInt(row.eq(6).text().trim().replace(/,/g, ''));

          const stockData = await this.fetchStockData(code);
          stockData.marketCapBillion = marketCapBillion;

          const existingStock = await stockPrice.findOne({ where: { code } });

          if (existingStock) {
            await stockPrice.update(stockData, { where: { code } });
          } else {
            await stockPrice.create(stockData);
          }
        }
      }
    } else {
      this.logger.debug('Outside of crawling hours');
    }
  }
}
