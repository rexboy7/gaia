function embedApp() {
  var iframe = document.createElement('iframe');
  iframe.setAttribute('mozbrowser', 'true');
  iframe.setAttribute('remote', 'true');
  iframe.setAttribute(
    'mozapp', 'app://test-nestoop.gaiamobile.org/manifest.webapp');
  iframe.src = 'app://test-nestoop.gaiamobile.org/index.html';
  iframe.style.width = '80%';
  iframe.style.height = '80%';
  document.body.appendChild(iframe);
}
var btn = document.getElementById('btn');
btn.addEventListener('click', embedApp);