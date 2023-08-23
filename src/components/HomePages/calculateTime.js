const calculateTime = (minutes) => {
    if (minutes <= 0) return null;

    const absMinutes = Math.abs(minutes); // take the absolute to handle negative and positive values

    if (absMinutes < 60) return `${absMinutes} minute${absMinutes === 1 ? '' : 's'}`;

    if (absMinutes < 1440) return `${Math.round(absMinutes / 60)} hour${Math.round(absMinutes / 60) === 1 ? '' : 's'}`;

    if (absMinutes < 10080) return `${Math.round(absMinutes / 1440)} day${Math.round(absMinutes / 1440) === 1 ? '' : 's'}`;

    if (absMinutes < 43200) return `${Math.round(absMinutes / 10080)} week${Math.round(absMinutes / 10080) === 1 ? '' : 's'}`;

    if (absMinutes < 518400) return `${Math.round(absMinutes / 43200)} month${Math.round(absMinutes / 43200) === 1 ? '' : 's'}`;

    return `${Math.round(absMinutes / 518400)} year${Math.round(absMinutes / 518400) === 1 ? '' : 's'}`;
};
    export default calculateTime;