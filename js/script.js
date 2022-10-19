  $(window).scroll(function() {
      const scroll = $(window).scrollTop();
      if (scroll > 0) {
          document.getElementsByClassName("head").classList.add("sticky");
      } else{
        document.getElementsByClassName("head").classList.remove("sticky");
      }
  });
  AOS.init();

  $("#one").click(function(){
    $("#tab-1").addClass("show");
    $("#tab-1").removeClass("tab-content");
    $("#tab-2").removeClass("show");
    $("#tab-2").addClass("tab-content");
    $("#one").addClass("active");
    $("#two").removeClass("active");
  });
  $("#two").click(function(){
    $("#tab-2").addClass("show");
    $("#tab-2").removeClass("tab-content");
    $("#tab-1").removeClass("show");
    $("#tab-1").addClass("tab-content");
    $("#two").addClass("active");
    $("#one").removeClass("active");
  });

/*---------------*/
var form = document.getElementById('settings');

function loadMedia() {
  var url = window.location.protocol + '//' + window.location.host + '/embed.html?file=' + encodeURIComponent(form.querySelector('#url').value || '') + '&type=';
  url += form.querySelector('#video-type').checked ? 'video' : 'audio';
  var ads = form.querySelector('#ads').value;
  if (ads) {
    url += '&ads=' + encodeURIComponent(ads.replace(/%/g, '~'));
  }
  if (form.querySelector('#autoplay').checked) {
    url += '&autoplay=true';
  }
  document.getElementById('media').src = url;
}

document.getElementById('permalink').addEventListener('click', function () {
  var el = document.createElement('textarea');
  el.value = document.getElementById('media').src;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  var selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
});
window.addEventListener('load', loadMedia);
form.addEventListener('submit', function (e) {
  loadMedia();
  e.preventDefault();
  e.stopPropagation();
  return false;
});
iFrameResize({
  checkOrigin: false,
  interval: 450,
});
