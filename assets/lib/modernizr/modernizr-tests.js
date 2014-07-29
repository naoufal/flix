// These custom tests depend on modernizr's addTest() Plugin API to function.

// Custom Modernizr Tests

// nktouch accurately detects touch devices
Modernizr.addTest('nktouch', function(){
  if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
    return true;
  }
});