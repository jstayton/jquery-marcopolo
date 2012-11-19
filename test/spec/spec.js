describe('Marco Polo', function () {
  var $input;

  beforeEach(function () {
    setFixtures('<form action="/marco/polo" method="get"><input type="text" name="input" id="input"></form>');
    $input = $('#input');
    $input.marcoPolo();
  });

  describe('create', function () {
    it('should add the class "mp_input"', function () {
      expect($input).toHaveClass('mp_input');
    });
  });
});
