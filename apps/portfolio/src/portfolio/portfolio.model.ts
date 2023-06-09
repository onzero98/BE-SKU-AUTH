import { BeforeUpdate, BeforeCreate, Table, Column, Model, DataType, CreatedAt, UpdatedAt, Unique} from 'sequelize-typescript';

@Table({
  indexes: [{
    name: 'UniqueUserAndCode',
    unique: true,
    fields: ['username', 'code']
  },]
})
export class Portfolio extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false, })
  username: string;

  @Column(DataType.STRING)
  code: string;

  @Column(DataType.STRING)
  companyName: string;

  @Column(DataType.INTEGER)
  amount: number;

  @Column(DataType.FLOAT)
  boughtPrice: number;

  @Column(DataType.FLOAT)
  avgPrice: number;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;

  @BeforeUpdate
  static updateAvgPrice(instance: Portfolio) {
    if (instance.amount !== 0) {
      instance.avgPrice = instance.boughtPrice / instance.amount;
    } else if (instance.amount === 0 && instance.previous('amount') !== 0) {
      instance.avgPrice = instance.previous('avgPrice');
    }
  }

  @BeforeCreate
  static createAvgPrice(instance: Portfolio) {
    if (instance.amount !== 0) {
      instance.avgPrice = instance.boughtPrice / instance.amount;
    } else {
      instance.avgPrice = 0;
    }
  }
}
