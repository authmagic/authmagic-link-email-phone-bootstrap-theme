function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
};

async function validate() {
  const token = localStorage.getItem('token');
  const response = await fetch(`/token/status/${encodeURIComponent(token)}`);
  if(response.status === 200) {
    renderInfo();
    document.getElementById('guest').style.display = 'none';
    document.getElementById('user').style.display = 'block';
  }
}

function renderInfo() {
  const token = localStorage.getItem('token');
  const info = parseJwt(token);
  document.getElementById('info').innerHTML = JSON.stringify(info);
}

function logout() {
  localStorage.setItem('token', '');
  location.reload();
}

async function refreshToken() {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const res = await fetch('/token', {
    body: JSON.stringify({token, refreshToken}),
    mode: 'cors',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
  });
  if(res.status === 200) {
    const {token, refreshToken} = await res.json();
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    validate();
  } else {
    console.log('forbidden');
  }
}

validate();
document.getElementById('go').onclick = function() {
  const emailElement = document.getElementById('email');
  const redirectUrl = document.getElementById('redirect-url').value;
  const email = emailElement.value;
  const data = {
    user: email,
    params: {r: Math.random()},
    redirectUrl,
  };
  fetch('/key', {
    body: JSON.stringify(data),
    mode: 'cors',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
  }).then(function(res) {
    return res.json();
  }).then(function({eproof}) {
    const interval = setInterval(async function() {
      const res = await fetch('/token', {
        body: JSON.stringify({eproof}),
        mode: 'cors',
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
      });
      if(res.status === 200) {
        clearInterval(interval);
        const {token, refreshToken} = await res.json();
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        validate();
      } else {
        console.log('forbidden');
      }
    }, 1000);
  });
  document.getElementById('guest').style.display = 'none';
  document.getElementById('stage').style.display = 'block';
};
document.getElementById('redirect-url').value = `${location.protocol}//${location.host}/check.html`;