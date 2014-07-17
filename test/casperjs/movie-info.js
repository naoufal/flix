casper.test.begin('Clicking on movie brings up info view.', function(test) {
  casper.start('http://localhost:5000', function() {
    this.viewport(640, 1136);
    this.click('.movie-list .movie:nth-of-type(1)');
    this.waitUntilVisible('.selected-movie.is-visible', function() {
      test.pass('Movie Info is visible');
    });
    this.wait(1000, function(){
      this.capture('test/screenshots/movie-list-' + Date.now() + '.png');
    });
  });

  casper.run(function() {
      test.done();
  });
});



casper.test.begin('Clicking back on movie view dismisses it.', function(test) {
  casper.start('http://localhost:5000', function() {
    this.viewport(640, 1136);
    this.click('.movie-list .movie:nth-of-type(1)');

    this.waitUntilVisible('.selected-movie.is-visible', function() {
      this.click('.selected-movie .btn.menu');
      test.assertDoesntExist('.selected-movie.is-visible');
      this.wait(1000, function(){
        test.pass('Movie Info is dismissed');
        this.capture('test/screenshots/movie-list-' + Date.now() + '.png');
      });
    });
  });

  casper.run(function() {
      test.done();
  });
});