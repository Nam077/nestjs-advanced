import 'winston-daily-rotate-file';
import { Injectable } from '@nestjs/common';

import {
    WinstonModuleOptions,
    WinstonModuleOptionsFactory,
    utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import { DailyRotateFile } from 'winston/lib/winston/transports';

import { formatLog } from '../../common';

export const loggerOptions = {
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
                nestWinstonModuleUtilities.format.nestLike('MyApp', {
                    colors: true,
                    prettyPrint: true,
                    processId: true,
                }),
            ),
        }),
        new DailyRotateFile({
            filename: '%DATE%',
            datePattern: 'DD-MM-YYYY',
            zippedArchive: true,
            extension: '.log',
            maxSize: '20m',
            maxFiles: '14d',
            dirname: 'logs',
            auditFile: 'logs/audit.json',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.printf(formatLog),
                winston.format((info) => {
                    if (info.context) {
                        return false; // Bỏ qua log của NestJS có thuộc tính context
                    }

                    return info;
                })(),
            ),
        }),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error', // Chỉ ghi các log có mức độ error trở lên
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.printf(formatLog),
            ),
        }),
    ],
};

/**
 * The Winston configuration class that implements the WinstonModuleOptionsFactory interface.
 */
@Injectable()
export class WinstonConfigService implements WinstonModuleOptionsFactory {
    /**
     * Creates the Winston module options.
     * @returns {WinstonModuleOptions | Promise<WinstonModuleOptions>} The Winston module options.
     */
    createWinstonModuleOptions(): WinstonModuleOptions {
        return loggerOptions;
    }
}
