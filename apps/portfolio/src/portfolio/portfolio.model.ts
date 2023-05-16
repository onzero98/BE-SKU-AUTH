import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, Unique} from 'sequelize-typescript';

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
  bPrice: number;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;
}
