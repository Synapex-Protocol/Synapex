/* SYNAPEX LAB — Infrastructure Tools Loader */
(function () {
  'use strict';
  const cards = document.querySelectorAll('.card-clickable[data-tool]');
  if (!cards.length) return;

  const TOOLS = {
    compute:    { icon: '\u{1F5A5}', title: 'Compute Marketplace',   sub: 'GPU Network Console',      init: SynapexLab.initCompute },
    models:     { icon: '\u{1F52C}', title: 'Model Repository',      sub: 'Research Model Browser',    init: SynapexLab.initModels },
    simulation: { icon: '\u{1F4CA}', title: 'Simulation Suite',      sub: 'Physics Environment Lab',   init: SynapexLab.initSimulation },
    collab:     { icon: '\u{1F30E}', title: 'Collaboration Network', sub: 'Research Community Hub',     init: SynapexLab.initCollab },
    dao:        { icon: '\u{1F5F3}', title: 'Research DAO',          sub: 'Governance Terminal',        init: SynapexLab.initDAO },
    ip:         { icon: '\u{1F6E1}', title: 'IP Protection',         sub: 'On-Chain IP Registry',       init: SynapexLab.initIP }
  };

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const t = TOOLS[card.dataset.tool];
      if (t) SynapexLab.openModal(t.icon, t.title, t.sub, t.init);
    });
  });
})();
