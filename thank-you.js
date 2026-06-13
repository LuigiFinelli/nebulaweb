(function () {
  'use strict';

  var heading = document.getElementById('thank-you-heading');
  var message = document.getElementById('thank-you-message');
  var urlParams = new URLSearchParams(window.location.search);
  var completedLater = urlParams.get('later') === 'true';

  if (!heading || !message) {
    return;
  }

  if (completedLater) {
    heading.textContent = 'Thank You For Your Enquiry';
    message.textContent = 'We\u2019ve received your initial enquiry. We\u2019ll email you a link to complete the project questionnaire when convenient.';
  } else {
    heading.textContent = 'Thank You For Completing The Project Questionnaire';
    message.textContent = 'We\u2019ve received your project details and will review them carefully before getting back to you.';
  }
})();
