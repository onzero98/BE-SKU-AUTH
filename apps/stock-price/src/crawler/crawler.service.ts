import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import cheerio, { CheerioAPI } from 'cheerio';
import { stockPrice } from '../stockPrice.model';
import * as iconv from 'iconv-lite';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: 'crawlAndSaveToDB',
    timeZone: 'Asia/Seoul',
  })
  async crawlAndSaveToDB() {

    const now = new Date();
    const startHour = 9;
    const endHour = 15;

    if (now.getHours() >= startHour && now.getHours() <= endHour) {
      for (let pageNum = 1; pageNum <= 20; pageNum++) {
        const url = `https://finance.naver.com/sise/entryJongmok.naver?&page=${pageNum}`;
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': 'yeti',
          },
        });
        const data = iconv.decode(Buffer.from(response.data), 'euc-kr');
        const $: CheerioAPI = cheerio.load(data);
        const rows = $('table.type_1 tbody tr');
  
        // 시작 인덱스와 종료 인덱스 지정
        const startRowIndex = 2; // 0-indexed, 세 번째 행
        const endRowIndex = 9; // 0-indexed, 열 번째 행
  
        for (let i = startRowIndex; i <= endRowIndex; i++) {
          const row = $(rows[i]).find('td');
          if (row.length === 0) continue;
  
          const code = $(row.find('a')[0]).attr('href').split('=')[1];
          const companyName = row.eq(0).text().trim();
          const currentPrice = parseInt(row.eq(1).text().trim().replace(/,/g, ''));
          const previousPriceDifference = parseInt(row.eq(2).text().trim().replace(/,/g, ''));
          const diffRate = parseFloat(row.eq(3).text().trim().replace(/%/g, ''));
          const tradeVolume = parseInt(row.eq(4).text().trim().replace(/,/g, ''));
          const tradePriceMillion = parseInt(row.eq(5).text().trim().replace(/,/g, ''));
          const marketCapBillion = parseInt(row.eq(6).text().trim().replace(/,/g, ''));
  
          const stockData = {
            code,
            companyName,
            currentPrice,
            previousPriceDifference,
            diffRate,
            tradeVolume,
            tradePriceMillion,
            marketCapBillion,
          };
  
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
