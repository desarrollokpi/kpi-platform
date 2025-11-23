const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.tz.setDefault();

const day = dayjs().get("date");
const month = dayjs().get("month") + 1;
const year = dayjs().get("year");
