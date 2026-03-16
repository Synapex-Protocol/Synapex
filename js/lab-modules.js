/* SYNAPEX LAB — AI Module Programs Loader */
(function () {
  'use strict';
  const cards = document.querySelectorAll('.module-clickable[data-module]');
  if (!cards.length) return;

  const MODULES = {
    facerec:  { icon: '\u{1F575}', title: 'Face Recognition',   sub: 'Module Configuration',    init: SynapexLab.initFaceRec },
    facescan: { icon: '\u{1F9F9}', title: '3D Face Scanning',   sub: 'Reconstruction Pipeline', init: SynapexLab.initFaceScan },
    objdet:   { icon: '\u{1F441}', title: 'Object Detection',   sub: 'Detection Engine',        init: SynapexLab.initObjDet },
    pose:     { icon: '\u{1F464}', title: 'Pose Estimation',    sub: 'Skeleton Tracker',        init: SynapexLab.initPose },
    speech:   { icon: '\u{1F5E3}', title: 'Speech Recognition', sub: 'ASR Pipeline',            init: SynapexLab.initSpeech },
    scene:    { icon: '\u{1F3AC}', title: 'Scene Understanding',sub: 'Panoptic Analysis',       init: SynapexLab.initScene }
  };

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const m = MODULES[card.dataset.module];
      if (m) SynapexLab.openModal(m.icon, m.title, m.sub, m.init);
    });
  });
})();
