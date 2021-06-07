
//Module for date

const today = new Date();

exports.getDate = function() {
  const dateOptions = {
    month : "long",
    weekday : "long",
    day : "2-digit"
  }

  return today.toLocaleDateString("en-US", dateOptions);
}

exports.getDay = function(){
  const dateOptions = {
    weekday : "long"
  }

  return today.toLocaleDateString("en-US", dateOptions);
}
