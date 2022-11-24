function getTime() {

    let time = new Date();
    let h = time.getHours();
    let m = time.getMinutes();
    let s = time.getSeconds();
    return (time.getMonth()+1) + "/" + time.getDate() + "/" + time.getFullYear() + "-" + (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
}

exports.getTime = getTime;