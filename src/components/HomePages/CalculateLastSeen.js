const calculateLastSeen = (minutes) => {
    if (minutes < 60)
        return minutes + " minute" + (minutes === 1 ? "" : "s") + " ago";
    if ((minutes / 60) < 24)
        return Math.round(minutes / 60) + " hour" + (Math.round(minutes / 60) === 1 ? "" : "s") + " ago";
    if ((minutes / 60) / 24 < 7)
        return Math.round((minutes / 60) / 24) + " day" + (Math.round((minutes / 60) / 24) === 1 ? "" : "s") + " ago";
    if ((minutes / 60) / 24 / 7 < 4)
        return Math.round((minutes / 60) / 24 / 7) + " week" + (Math.round((minutes / 60) / 24 / 7) === 1 ? "" : "s") + " ago";
    if ((minutes / 60) / 24 / 30 < 12)
        return Math.round((minutes / 60) / 24 / 30) + " month" + (Math.round((minutes / 60) / 24 / 30) === 1 ? "" : "s") + " ago";
    return Math.round((minutes / 60) / 24 / 365) + " year" + (Math.round((minutes / 60) / 24 / 365) === 1 ? "" : "s") + " ago";
}

export default calculateLastSeen;