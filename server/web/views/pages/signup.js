$('#signup').click((event) => {
  event.preventDefault();

  const values = {
    name: $('#name').val(),
    email: $('#email').val(),
    username: $('#username').val(),
    password: $('#password').val()
  };

  $.ajax({
    type: 'POST',
    url: '/api/signup',
    data: values,
    success: function (result) {
      location.reload();
    },
    error: function (result) {
      console.error(result);
    }
  });
});
