import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement} from 'sequelize-typescript';

@Table
export class Order extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  orderId: string;

  @Column({
    type: DataType.ENUM,
    values: ['W', 'P', 'F', 'C'],
    allowNull: false,
  })
  status: 'W' | 'P' | 'F' | 'C';

  @Column({ type: DataType.STRING, allowNull: false })
  username: string;

  @Column({ type: DataType.STRING, allowNull: false })
  companyName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  code: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  amount: number;

  @Column({
    type: DataType.ENUM,
    values: ['B', 'S'],
    allowNull: false,
  })
  method: 'B' | 'S';

  @Column({ type: DataType.FLOAT, allowNull: false })
  price: number;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;
}
