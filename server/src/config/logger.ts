import winston from "winston";

const { combine, timestamp, json, errors } = winston.format;
export const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), errors({}), json()),
  transports: [new winston.transports.Console()],
});
