import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, Unique} from 'sequelize-typescript';

@Table
export class Account extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Unique
  @Column({ type: DataType.STRING, allowNull: false, })
  username: string;

  @Column(DataType.INTEGER)
  credit: number;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;
}
