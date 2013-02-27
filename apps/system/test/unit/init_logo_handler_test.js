requireApp('system/js/init_logo_handler.js');

suite('InitLogoHandler', function() {

  function triggerEvent(element, eventName) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, true, true);
    element.dispatchEvent(event);
  };

  var subject;
  var mockStyle;
  suiteSetup(function() {
    subject = InitLogoHandler;

    var osLogo = document.createElement('div');
    osLogo.id = 'os-logo';
    osLogo.innerHTML = '<div id="carrier-logo"></div>';
    document.body.appendChild(osLogo);
  })
  
  test('Init', function(done) {
    subject.carrierImagePath = '/test/unit/resources/mock_carrier_logo.png';
    subject.init();
    subject._waitReady(function() {
      assert.equal(subject.carrierPowerOnElement.tagName, 'IMG');
      done();
    });
  });

  test('Animate',  function() {
    var osLogo = document.getElementById('os-logo');
    subject.animate();
    assert.equal(subject.carrierPowerOnElement.className, 'hide');
    triggerEvent(subject.carrierPowerOnElement, 'transitionend');
    assert.equal(osLogo.className, 'hide');
    triggerEvent(osLogo, 'transitionend');
    assert.isNull(document.getElementById('os-logo'));
  });

  suiteTeardown(function() {
    var osLogo;
    var carrierLogo;

    if(carrierLogo = document.getElementById('carrier-logo'))
      carrierLogo.parentNode.removeChild(carrierLogo);

    if(osLogo = document.getElementById('os-logo'))
      osLogo.parentNode.removeChild(osLogo);
  })

});