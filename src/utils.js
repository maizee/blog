export function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year} 年 ${month} 月 ${day} 日`;
}

export function estimateReadingTime(content = "") {
  const cjkCharacters = (content.match(/[\u3400-\u9fff]/g) || []).length;
  const latinWords = (content.replace(/[\u3400-\u9fff]/g, " ").match(/[A-Za-z0-9_]+/g) || []).length;
  const totalUnits = cjkCharacters + latinWords;
  const minutes = Math.max(1, Math.ceil(totalUnits / 300));
  return `${minutes} 分钟阅读`;
}

// debounce function
export function debounce(fn, delay) {
  let timer = null;
  return function () {
    let context = this;
    let args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

export function formatDateV2(date) {
  let d = new Date(date);
  let localTime = d.toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
  let formattedDate = localTime.replace(/\//g, "-").replace(/\s/g, "");
  return formattedDate;
}
