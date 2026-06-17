/**
 * icons.js — Emoji → SVG Icon Replacement
 * Replaces emoji text chars with Phosphor icon <i> tags site-wide.
 * Requires Phosphor Icons web CDN to be loaded.
 */
(function () {
  // emoji character → Phosphor icon class(es)
  const MAP = {
    '🔥': 'ph-fill ph-fire',
    '🎯': 'ph-fill ph-target',
    '📈': 'ph-fill ph-trend-up',
    '📉': 'ph-fill ph-trend-down',
    '🏆': 'ph-fill ph-trophy',
    '⚠':  'ph ph-warning',
    '⚠️': 'ph ph-warning',
    '✅': 'ph-fill ph-check-circle',
    '❌': 'ph-fill ph-x-circle',
    '📋': 'ph-fill ph-clipboard-text',
    '💰': 'ph-fill ph-money',
    '💵': 'ph-fill ph-currency-dollar-simple',
    '💸': 'ph-fill ph-money-wavy',
    '⭐': 'ph-fill ph-star',
    '★':  'ph-fill ph-star',
    '☆':  'ph ph-star',
    '🚨': 'ph-fill ph-siren',
    '📰': 'ph-fill ph-newspaper',
    '🧊': 'ph-fill ph-snowflake',
    '❄':  'ph ph-snowflake',
    '❄️': 'ph ph-snowflake',
    '🥶': 'ph-fill ph-snowflake',
    '🏈': 'ph-fill ph-football',
    '📊': 'ph-fill ph-chart-bar',
    '💎': 'ph-fill ph-diamond',
    '🌡': 'ph-fill ph-thermometer',
    '🌡️': 'ph-fill ph-thermometer',
    '✨': 'ph-fill ph-sparkle',
    '📅': 'ph-fill ph-calendar',
    '🔒': 'ph-fill ph-lock-simple',
    '👁':  'ph ph-eye',
    '👁️': 'ph ph-eye',
    '👀': 'ph ph-eyes',
    '🔄': 'ph ph-arrows-clockwise',
    '🔍': 'ph ph-magnifying-glass',
    '🏟': 'ph-fill ph-stadium',
    '🏟️': 'ph-fill ph-stadium',
    '🏠': 'ph-fill ph-house',
    '🎓': 'ph-fill ph-graduation-cap',
    '📡': 'ph-fill ph-broadcast',
    '🤖': 'ph-fill ph-robot',
    '🧠': 'ph-fill ph-brain',
    '🧮': 'ph-fill ph-calculator',
    '🛡':  'ph-fill ph-shield-check',
    '🛡️': 'ph-fill ph-shield-check',
    '⚔':  'ph-fill ph-sword',
    '⚔️': 'ph-fill ph-sword',
    '⚖':  'ph-fill ph-scales',
    '⚖️': 'ph-fill ph-scales',
    '📚': 'ph-fill ph-books',
    '📐': 'ph-fill ph-ruler',
    '🏃': 'ph-fill ph-person-simple-run',
    '🏃‍♂️': 'ph-fill ph-person-simple-run',
    '👥': 'ph-fill ph-users-three',
    '💪': 'ph-fill ph-hand-fist',
    '📌': 'ph-fill ph-map-pin',
    '📍': 'ph-fill ph-map-pin',
    '📣': 'ph-fill ph-megaphone',
    '📢': 'ph-fill ph-megaphone-simple',
    '📺': 'ph-fill ph-monitor',
    '⚡': 'ph-fill ph-lightning',
    '⚡️': 'ph-fill ph-lightning',
    '💡': 'ph-fill ph-lightbulb',
    '🌧': 'ph-fill ph-cloud-rain',
    '🌧️': 'ph-fill ph-cloud-rain',
    '🌬': 'ph-fill ph-wind',
    '🌬️': 'ph-fill ph-wind',
    '💨': 'ph-fill ph-wind',
    '☀':  'ph-fill ph-sun',
    '☀️': 'ph-fill ph-sun',
    '☁':  'ph-fill ph-cloud',
    '☁️': 'ph-fill ph-cloud',
    '🌤': 'ph-fill ph-cloud-sun',
    '🌤️': 'ph-fill ph-cloud-sun',
    '🌦': 'ph-fill ph-cloud-rain',
    '🌦️': 'ph-fill ph-cloud-rain',
    '🌙': 'ph-fill ph-moon',
    '✈':  'ph-fill ph-airplane',
    '✈️': 'ph-fill ph-airplane',
    '✎':  'ph ph-pencil-simple',
    '✓':  'ph ph-check',
    '✕':  'ph ph-x',
    '⏰': 'ph-fill ph-alarm',
    '⏱':  'ph ph-timer',
    '⏳': 'ph ph-hourglass',
    '⏸':  'ph-fill ph-pause-circle',
    '➡':  'ph ph-arrow-right',
    '➡️': 'ph ph-arrow-right',
    '🔢': 'ph-fill ph-hash',
    '💢': 'ph ph-warning-diamond',
    '💀': 'ph-fill ph-skull',
    '🐦': 'ph-fill ph-bird',
    '🎰': 'ph-fill ph-dice-five',
    '🥇': 'ph-fill ph-medal',
    '🥈': 'ph-fill ph-medal',
    '🥉': 'ph-fill ph-medal',
    '🏔': 'ph-fill ph-mountains',
    '🏔️': 'ph-fill ph-mountains',
    '🚫': 'ph-fill ph-prohibit',
    '🎲': 'ph-fill ph-dice-five',
    '🔑': 'ph-fill ph-key',
    '📷': 'ph-fill ph-camera',
    '🏈️': 'ph-fill ph-football',
    '😮': 'ph ph-smiley-surprised',
    '😴': 'ph ph-moon-stars',
    '🐶': 'ph-fill ph-dog',
    '🐉': 'ph-fill ph-dragon',
    '💪': 'ph-fill ph-hand-fist',
    '🏅': 'ph-fill ph-medal',
    '🔮': 'ph-fill ph-magic-wand',
    '🎯': 'ph-fill ph-target',
    '📸': 'ph-fill ph-camera',
    '📱': 'ph-fill ph-device-mobile',
    '💻': 'ph-fill ph-laptop',
    '🖥':  'ph-fill ph-monitor',
    '🔔': 'ph-fill ph-bell',
    '🔕': 'ph-fill ph-bell-slash',
  };

  // Sorted by length descending so multi-char sequences match first
  const SORTED = Object.entries(MAP).sort((a, b) => b[0].length - a[0].length);

  function walk(node) {
    if (!node) return;
    if (node.nodeType === 3) {          // text node
      replaceInText(node);
    } else if (
      node.nodeType === 1 &&
      node.tagName !== 'SCRIPT' &&
      node.tagName !== 'STYLE' &&
      node.tagName !== 'TEXTAREA' &&
      !node.classList.contains('no-icon')
    ) {
      // clone children array since we may modify the list
      Array.from(node.childNodes).forEach(walk);
    }
  }

  function replaceInText(node) {
    const text = node.textContent;
    let i = 0, out = '', changed = false;
    while (i < text.length) {
      let hit = false;
      for (const [em, cls] of SORTED) {
        if (text.startsWith(em, i)) {
          out += `<i class="${cls}" aria-hidden="true" style="font-size:1em;vertical-align:-0.1em"></i>`;
          i += em.length;
          hit = changed = true;
          break;
        }
      }
      if (!hit) out += text[i++];
    }
    if (changed) {
      const span = document.createElement('span');
      span.innerHTML = out;
      node.parentNode.replaceChild(span, node);
    }
  }

  function init() {
    walk(document.body);
  }

  // Run after Phosphor script has had time to register
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      // Small delay lets Phosphor's MutationObserver settle
      setTimeout(init, 0);
    });
  } else {
    setTimeout(init, 0);
  }
})();
