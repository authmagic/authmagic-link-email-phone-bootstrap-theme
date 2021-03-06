function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

async function check(ekey) {
  const response = await fetch('/token', {
    body: JSON.stringify({ekey}),
    mode: 'cors',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
  });
  if(response.status === 200) {
    const {token, refreshToken} = await response.json();
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    location.href = '/profile.html';
  } else {
    document.getElementById('check').innerHTML = 'Key is invalid';
  }
}

if(localStorage.getItem('token') && !getParameterByName('ekey')) {
  location.href = '/profile.html';
} else {
  const ekey = getParameterByName('ekey');
  check(ekey);
}