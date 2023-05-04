import { Table, Column, Model, DataType, PrimaryKey, CreatedAt, UpdatedAt, Unique } from 'sequelize-typescript';

@Table
export class stockPrice extends Model {
  @PrimaryKey
  @Unique
  @Column(DataType.STRING)
  code: string;

  @Column(DataType.STRING)
  companyName: string;

  @Column(DataType.INTEGER)
  currentPrice: number;

  @Column(DataType.INTEGER)
  previousPriceDifference: number;

  @Column(DataType.FLOAT)
  diffRate: number;

  @Column(DataType.INTEGER)
  tradeVolume: number;

  @Column(DataType.INTEGER)
  marketCapBillion: number;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;
}
