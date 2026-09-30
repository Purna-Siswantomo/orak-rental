// Fills every .spk with the Claude-style spark mark (a simple illustration for the interface mockups)
const SPK = '<svg viewBox="0 0 24 24"><g stroke="#D97757" stroke-width="2.6" stroke-linecap="round"><path d="M12 2.5v6.5M12 15v6.5M2.5 12H9M15 12h6.5M5.3 5.3l4.6 4.6M14.1 14.1l4.6 4.6M5.3 18.7l4.6-4.6M14.1 9.9l4.6-4.6"/></g></svg>';
document.querySelectorAll(".spk").forEach(e => e.innerHTML = SPK);
