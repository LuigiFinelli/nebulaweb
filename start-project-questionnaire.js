(function () {
  'use strict';

  /*
   * Questionnaire section visibility
   * Each dynamic section is shown when the selected main service matches
   * one of the allowed values for that section type.
   */
  var SECTION_RULES = {
    design: ['Website Design', 'Multiple Services', 'Not Sure'],
    hosting: ['Website Hosting', 'Multiple Services', 'Not Sure'],
    maintenance: ['Website Maintenance', 'Multiple Services', 'Not Sure'],
    seo: ['SEO Optimisation', 'Multiple Services', 'Not Sure']
  };

  var serviceFromParam = {
    design: 'Website Design',
    hosting: 'Website Hosting',
    maintenance: 'Website Maintenance',
    seo: 'SEO Optimisation',
    multiple: 'Multiple Services',
    'not-sure': 'Not Sure'
  };

  var serviceSelect = document.getElementById('main-service');
  var guidanceNote = document.getElementById('questionnaire-guidance');
  var dynamicSections = document.querySelectorAll('[data-questionnaire-section]');

  if (!serviceSelect || !dynamicSections.length) {
    return;
  }

  var urlParams = new URLSearchParams(window.location.search);

  /*
   * Pre-fill contact details from sessionStorage (set by the contact form)
   * or from URL query parameters when available.
   *
   * Example: start-project.html?service=design
   */
  function prefillField(fieldId, value) {
    if (!value) {
      return;
    }

    var field = document.getElementById(fieldId);

    if (field && !field.value) {
      field.value = value;
    }
  }

  prefillField('full-name', urlParams.get('name') || sessionStorage.getItem('nebulaweb-contact-name'));
  prefillField('email', urlParams.get('email') || sessionStorage.getItem('nebulaweb-contact-email'));
  prefillField('business-name', urlParams.get('business') || sessionStorage.getItem('nebulaweb-contact-business'));
  prefillField('phone', urlParams.get('phone') || sessionStorage.getItem('nebulaweb-contact-phone'));

  var serviceParam = urlParams.get('service') || sessionStorage.getItem('nebulaweb-contact-service');

  if (serviceParam && serviceFromParam[serviceParam]) {
    serviceSelect.value = serviceFromParam[serviceParam];
  }

  // Mark the form as JS-enhanced so CSS can hide irrelevant sections.
  document.documentElement.classList.add('questionnaire-js');

  function shouldShowSection(sectionType, selectedService) {
    if (!selectedService) {
      // No selection yet — keep all sections visible (same as no-JS behaviour).
      return true;
    }

    var allowedServices = SECTION_RULES[sectionType];
    return allowedServices && allowedServices.indexOf(selectedService) !== -1;
  }

  function setSectionFieldsEnabled(section, enabled) {
    var fields = section.querySelectorAll('input, select, textarea');

    fields.forEach(function (field) {
      field.disabled = !enabled;
    });
  }

  function updateQuestionnaireSections() {
    var selectedService = serviceSelect.value;

    dynamicSections.forEach(function (section) {
      var sectionType = section.getAttribute('data-questionnaire-section');
      var show = shouldShowSection(sectionType, selectedService);

      section.hidden = !show;
      setSectionFieldsEnabled(section, show);
    });

    if (guidanceNote) {
      guidanceNote.hidden = selectedService !== 'Not Sure';
    }
  }

  serviceSelect.addEventListener('change', updateQuestionnaireSections);
  updateQuestionnaireSections();
})();
