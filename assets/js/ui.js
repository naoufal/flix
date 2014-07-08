var $        = require('jquery');

module.exports.init = function(){
  $('.overlay').on('click', function(){
    $('.sidebar').removeClass('is-visible');
  });
};