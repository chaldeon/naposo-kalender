'use client';

import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { useTheme } from '@/context/ThemeContext';

export default function BarChart({ labels, data, label, color = 'rgba(59,130,246,.55)', borderColor = 'rgba(59,130,246,.9)' }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;
    const isDark = theme === 'dark';
    const tickColor = isDark ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.45)';
    const gridColor = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)';

    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current.getContext('2d'), {
      type: 'bar',
      data: { labels, datasets: [{ label, data, backgroundColor: color, borderColor, borderWidth: 1, borderRadius: 3 }] },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: tickColor, font: { size: 9 }, maxRotation: 60 }, grid: { display: false } },
          y: { ticks: { color: tickColor, font: { size: 10 }, stepSize: 1 }, grid: { color: gridColor } },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [labels, data, label, color, borderColor, theme]);

  return <canvas ref={canvasRef} height="220" />;
}
