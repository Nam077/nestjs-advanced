import { FindOneOptions } from 'typeorm';

export interface FindOneOptionsCustom<Entity> extends Omit<FindOneOptions<Entity>, 'where'> {}
