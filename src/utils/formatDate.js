import moment from "moment";

export const formatDate = (date) => {
  const utcDate = new Date(date);

  if (isNaN(utcDate.getTime())) {
    console.error("Invalid date object");
    return "";
  }

  const localDate = new Date(
    utcDate.getTime() + utcDate.getTimezoneOffset() * 60000
  );
  console.log(localDate);

  let day = localDate.getDate() + 1;
  if (day > 0 && day < 10) {
    day = `0${day}`;
  }

  let month = localDate.getMonth() + 1;
  if (month > 0 && month < 10) {
    month = `0${month}`;
  }

  let year = localDate.getFullYear();

  if (day > 31 && month === 12) {
    day = "01";
    month = "01";
    year += 1;
  }

  return `${day}-${month}-${year}`;
};

export const formatTime = (timestamp) => {
  const now = moment();
  const messageTime = moment(timestamp);
  const diffInDays = now.diff(messageTime, "days");
  if (diffInDays === 0) {
    return `Hôm nay lúc ${messageTime.format("HH:mm")}`;
  } else if (diffInDays === 1) {
    return `Hôm qua lúc ${messageTime.format("HH:mm")}`;
  } else {
    return messageTime.format("DD/MM/YYYY [lúc] HH:mm");
  }
};
