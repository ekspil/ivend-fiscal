class DateUtils {

    /**
     * Str should be in format "26.08.2019 17:05:19"
     * @returns {Date}
     */
    static getDateFromStr(dateStr) {
        const [date, time] = dateStr.split(" ")
        const [day, month, year] = date.split(".")
        const [hours, minutes, seconds] = time.split(":")

        return new Date(Number(year), Number(month) - 1, Number(day), Number(hours) - 3, Number(minutes), Number(seconds))
    }
}


module.exports = DateUtils

