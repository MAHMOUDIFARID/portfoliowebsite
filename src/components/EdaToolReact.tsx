import { useState, useMemo, useRef } from 'react';
import { 
  UploadSimpleIcon, 
  DatabaseIcon, 
  TableIcon, 
  InfoIcon, 
  TrendUpIcon, 
  GridFourIcon,
  XIcon
} from '@phosphor-icons/react';

// --- Sample Datasets ---
const SAMPLES = {
  housing: `Area_SqFt,Bedrooms,Bathrooms,Age_Years,Distance_Miles,Price_USD,Type
1200,2,1.5,15,4.2,210000,Condo
1800,3,2,8,8.5,315000,Suburban
2400,4,3,3,12.0,420000,Suburban
850,1,1,20,1.5,165000,Apartment
3100,5,4.5,1,15.5,580000,Estate
1500,3,2,12,6.0,265000,Suburban
1100,2,1,18,3.5,185000,Condo
2000,4,2.5,5,10.0,360000,Suburban
950,2,1.5,25,2.1,195000,Apartment
2800,4,3.5,2,9.2,495000,Suburban
1600,3,2,10,5.1,280000,Condo
2200,4,3,6,11.3,390000,Suburban`,

  students: `Name,Math_Score,Science_Score,English_Score,Absences,Passed
Sofia,88,92,85,2,Yes
Liam,95,89,90,1,Yes
Emma,62,75,70,5,Yes
Noah,45,55,58,12,No
Olivia,78,80,82,3,Yes
Ethan,85,88,79,4,Yes
Ava,91,94,92,0,Yes
Mason,55,60,65,8,No
Isabella,72,68,75,6,Yes
Lucas,89,90,87,2,Yes
Mia,40,45,52,15,No
Oliver,98,96,94,1,Yes`,

  sales: `Month,Transactions,Revenue,Ad_Spend,Conversion_Rate,Promo_Active
January,120,4500,500,2.1,No
February,145,5400,600,2.3,No
March,190,7200,850,2.5,Yes
April,210,8100,1000,2.7,Yes
May,180,6800,750,2.4,No
June,250,9800,1200,3.1,Yes
July,270,10500,1300,3.2,Yes
August,240,9200,1100,3.0,Yes
September,195,7500,900,2.6,No
October,215,8300,1050,2.8,Yes
November,310,12500,1600,3.5,Yes
December,380,15200,2000,3.8,Yes`
};

// --- Custom CSV Parser ---
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(cell.trim());
      if (row.length > 0 && (row.length > 1 || row[0] !== '')) {
        lines.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell.trim());
    lines.push(row);
  }
  return lines;
}

interface ColumnMeta {
  name: string;
  type: 'numeric' | 'categorical';
  missingCount: number;
  mean?: number;
  median?: number;
  min?: number;
  max?: number;
  stdDev?: number;
  uniqueValues?: number;
  topValue?: string;
  topFreq?: number;
}

export default function EdaToolReact() {
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'columns' | 'charts' | 'correlation'>('overview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination for table preview
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 7;

  // Chart configuration state
  const [chartType, setChartType] = useState<'bar' | 'scatter' | 'line'>('bar');
  const [xCol, setXCol] = useState<string>('');
  const [yCol, setYCol] = useState<string>('');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ x: number | string; y: number | string; svgX: number; svgY: number } | null>(null);

  const resetDataState = (parsed: string[][], name: string) => {
    setCsvData(parsed);
    setFileName(name);
    setCurrentPage(0);
    setActiveTab('overview');
    setHoveredDataPoint(null);

    if (parsed.length > 1) {
      const headers = parsed[0];
      setXCol(headers[0]);
      setYCol(headers[1] || headers[0]);
    }
  };

  const loadSample = (key: keyof typeof SAMPLES) => {
    const raw = SAMPLES[key];
    const parsed = parseCSV(raw);
    resetDataState(parsed, `${key.charAt(0).toUpperCase() + key.slice(1)} Dataset`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      resetDataState(parsed, file.name);
    };
    reader.readAsText(file);
  };

  const [isDragOver, setIsDragOver] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        resetDataState(parsed, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    setCsvData(null);
    setFileName('');
  };

  const analysis = useMemo(() => {
    if (!csvData || csvData.length <= 1) return null;

    const headers = csvData[0];
    const dataRows = csvData.slice(1);
    const rowCount = dataRows.length;
    const colCount = headers.length;

    const isNumericColumn = (colIndex: number): boolean => {
      let numericHits = 0;
      let nonEmptyCount = 0;
      for (let r = 0; r < dataRows.length; r++) {
        const val = dataRows[r][colIndex];
        if (val !== undefined && val !== '') {
          nonEmptyCount++;
          const num = Number(val);
          if (!isNaN(num)) numericHits++;
        }
      }
      if (nonEmptyCount === 0) return false;
      return (numericHits / nonEmptyCount) >= 0.8;
    };

    const columns: ColumnMeta[] = headers.map((name, colIdx) => {
      const isNum = isNumericColumn(colIdx);
      const values = dataRows.map(row => row[colIdx]);
      
      const missingCount = values.filter(v => v === undefined || v === '').length;

      if (isNum) {
        const parsedNums = values
          .map(v => Number(v))
          .filter(v => !isNaN(v) && v !== null);

        if (parsedNums.length === 0) {
          return { name, type: 'categorical', missingCount };
        }

        const sorted = [...parsedNums].sort((a, b) => a - b);
        const sum = parsedNums.reduce((a, b) => a + b, 0);
        const mean = sum / parsedNums.length;
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];

        const variance = parsedNums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (parsedNums.length - 1 || 1);
        const stdDev = Math.sqrt(variance);

        return {
          name,
          type: 'numeric',
          missingCount,
          mean: Math.round(mean * 100) / 100,
          median: Math.round(median * 100) / 100,
          min: Math.round(min * 100) / 100,
          max: Math.round(max * 100) / 100,
          stdDev: Math.round(stdDev * 100) / 100
        };
      } else {
        const counts: Record<string, number> = {};
        values.forEach(v => {
          if (v !== undefined && v !== '') {
            counts[v] = (counts[v] || 0) + 1;
          }
        });

        const uniqueEntries = Object.keys(counts);
        let topValue = 'N/A';
        let topFreq = 0;

        uniqueEntries.forEach(k => {
          if (counts[k] > topFreq) {
            topValue = k;
            topFreq = counts[k];
          }
        });

        return {
          name,
          type: 'categorical',
          missingCount,
          uniqueValues: uniqueEntries.length,
          topValue,
          topFreq
        };
      }
    });

    const numericalColumns = columns.filter(c => c.type === 'numeric').map(c => c.name);
    const categoricalColumns = columns.filter(c => c.type === 'categorical').map(c => c.name);

    return {
      rowCount,
      colCount,
      columns,
      numericalColumns,
      categoricalColumns,
      headers
    };
  }, [csvData]);

  const correlations = useMemo(() => {
    if (!analysis || !csvData) return null;
    const numCols = analysis.numericalColumns;
    if (numCols.length < 2) return null;

    const dataRows = csvData.slice(1);
    const matrix: Record<string, Record<string, number>> = {};

    const getColValues = (colName: string): number[] => {
      const idx = analysis.headers.indexOf(colName);
      return dataRows.map(row => Number(row[idx])).filter(v => !isNaN(v));
    };

    numCols.forEach(colX => {
      matrix[colX] = {};
      const valsX = getColValues(colX);
      const meanX = valsX.reduce((a, b) => a + b, 0) / (valsX.length || 1);

      numCols.forEach(colY => {
        if (colX === colY) {
          matrix[colX][colY] = 1;
          return;
        }

        const valsY = getColValues(colY);
        const meanY = valsY.reduce((a, b) => a + b, 0) / (valsY.length || 1);

        let numSum = 0;
        let denSumX = 0;
        let denSumY = 0;

        const maxIdx = Math.min(valsX.length, valsY.length);
        for (let i = 0; i < maxIdx; i++) {
          const dx = valsX[i] - meanX;
          const dy = valsY[i] - meanY;
          numSum += dx * dy;
          denSumX += dx * dx;
          denSumY += dy * dy;
        }

        const denominator = Math.sqrt(denSumX * denSumY);
        const r = denominator === 0 ? 0 : numSum / denominator;
        matrix[colX][colY] = Math.round(r * 100) / 100;
      });
    });

    return matrix;
  }, [analysis, csvData]);

  // --- SVG Plotting Data Calculations ---
  const chartSvgData = useMemo(() => {
    if (!csvData || !analysis || !xCol || !yCol) return null;

    const xIdx = analysis.headers.indexOf(xCol);
    const yIdx = analysis.headers.indexOf(yCol);
    const dataRows = csvData.slice(1);

    const margin = { top: 20, right: 30, bottom: 45, left: 60 };
    const svgWidth = 520;
    const svgHeight = 320;
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    if (chartType === 'scatter') {
      const xVals = dataRows.map(r => Number(r[xIdx])).filter(v => !isNaN(v));
      const yVals = dataRows.map(r => Number(r[yIdx])).filter(v => !isNaN(v));

      if (xVals.length === 0 || yVals.length === 0) return null;

      const xMin = Math.min(...xVals);
      const xMax = Math.max(...xVals);
      const yMin = Math.min(...yVals);
      const yMax = Math.max(...yVals);

      const points = dataRows
        .map((row) => {
          const x = Number(row[xIdx]);
          const y = Number(row[yIdx]);
          if (isNaN(x) || isNaN(y)) return null;

          const cx = margin.left + ((x - xMin) / (xMax - xMin || 1)) * chartWidth;
          const cy = margin.top + chartHeight - ((y - yMin) / (yMax - yMin || 1)) * chartHeight;
          return { cx, cy, valX: x, valY: y };
        })
        .filter(p => p !== null);

      return {
        svgWidth,
        svgHeight,
        margin,
        points,
        xMin: Math.round(xMin * 10) / 10,
        xMax: Math.round(xMax * 10) / 10,
        yMin: Math.round(yMin * 10) / 10,
        yMax: Math.round(yMax * 10) / 10,
        chartWidth,
        chartHeight
      };
    } else if (chartType === 'line') {
      const yVals = dataRows.map(r => Number(r[yIdx])).filter(v => !isNaN(v));
      if (yVals.length === 0) return null;

      const yMin = Math.min(...yVals);
      const yMax = Math.max(...yVals);
      const stepX = chartWidth / (yVals.length - 1 || 1);

      const points = yVals.map((y, idx) => {
        const cx = margin.left + idx * stepX;
        const cy = margin.top + chartHeight - ((y - yMin) / (yMax - yMin || 1)) * chartHeight;
        return { cx, cy, valX: idx, valY: y };
      });

      let pathD = '';
      let areaD = '';

      points.forEach((p, idx) => {
        if (idx === 0) {
          pathD = `M ${p.cx} ${p.cy}`;
          areaD = `M ${p.cx} ${margin.top + chartHeight} L ${p.cx} ${p.cy}`;
        } else {
          pathD += ` L ${p.cx} ${p.cy}`;
          areaD += ` L ${p.cx} ${p.cy}`;
          if (idx === points.length - 1) {
            areaD += ` L ${p.cx} ${margin.top + chartHeight} Z`;
          }
        }
      });

      return {
        svgWidth,
        svgHeight,
        margin,
        points,
        pathD,
        areaD,
        yMin: Math.round(yMin * 10) / 10,
        yMax: Math.round(yMax * 10) / 10,
        chartWidth,
        chartHeight
      };
    } else {
      // 'bar' chart
      const xMeta = analysis.columns.find(c => c.name === xCol);
      if (!xMeta) return null;

      let categories: string[] = [];
      let counts: number[] = [];

      if (xMeta.type === 'categorical') {
        const frequencies: Record<string, number> = {};
        dataRows.forEach(row => {
          const val = row[xIdx];
          if (val !== undefined && val !== '') {
            frequencies[val] = (frequencies[val] || 0) + 1;
          }
        });

        const sortedCats = Object.entries(frequencies)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 7);

        categories = sortedCats.map(e => e[0]);
        counts = sortedCats.map(e => e[1]);
      } else {
        const xVals = dataRows.map(r => Number(r[xIdx])).filter(v => !isNaN(v));
        if (xVals.length === 0) return null;

        const xMin = Math.min(...xVals);
        const xMax = Math.max(...xVals);
        const binCount = 7;
        const binWidth = (xMax - xMin || 1) / binCount;

        categories = Array.from({ length: binCount }).map((_, idx) => {
          const start = xMin + idx * binWidth;
          const end = start + binWidth;
          return `${Math.round(start)}-${Math.round(end)}`;
        });
        counts = Array.from({ length: binCount }).fill(0) as number[];

        xVals.forEach(val => {
          const binIdx = Math.min(
            Math.floor((val - xMin) / binWidth),
            binCount - 1
          );
          counts[binIdx]++;
        });
      }

      const maxCount = Math.max(...counts, 1);
      const barPadding = 12;
      const totalBarWidth = chartWidth / (categories.length || 1);
      const finalBarWidth = Math.max(totalBarWidth - barPadding, 4);

      const bars = categories.map((cat, idx) => {
        const count = counts[idx];
        const barHeight = (count / maxCount) * chartHeight;
        const x = margin.left + idx * totalBarWidth + barPadding / 2;
        const y = margin.top + chartHeight - barHeight;

        return {
          x,
          y,
          width: finalBarWidth,
          height: barHeight,
          category: cat,
          val: count
        };
      });

      return {
        svgWidth,
        svgHeight,
        margin,
        bars,
        maxCount,
        chartWidth,
        chartHeight
      };
    }
  }, [csvData, analysis, chartType, xCol, yCol]);

  const handleSvgHover = (e: React.MouseEvent, valX: string | number, valY: string | number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgEl = e.currentTarget.closest('svg');
    if (svgEl) {
      const svgRect = svgEl.getBoundingClientRect();
      setHoveredDataPoint({
        x: valX,
        y: valY,
        svgX: rect.left - svgRect.left + rect.width / 2,
        svgY: rect.top - svgRect.top - 8
      });
    }
  };

  const handleSvgLeave = () => {
    setHoveredDataPoint(null);
  };

  const statsOverview = useMemo(() => {
    if (!analysis) return null;
    return [
      { label: 'Total Rows', val: analysis.rowCount, desc: 'Records processed' },
      { label: 'Total Columns', val: analysis.colCount, desc: 'Total dimensions' },
      { label: 'Numerical Features', val: analysis.numericalColumns.length, desc: 'Continuous metrics' },
      { label: 'Categorical Features', val: analysis.categoricalColumns.length, desc: 'Label sets' }
    ];
  }, [analysis]);

  return (
    <div className="w-full bg-white/70 dark:bg-white/[0.01] backdrop-blur-2xl border border-neutral-200 dark:border-white/10 rounded-4xl p-6 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-300">
      
      {/* Decorative Blur Dot */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      {/* --- File Uploader Panel --- */}
      {!csvData ? (
        <div className="flex flex-col items-center relative z-10">
          <div className="text-center max-w-lg mb-12">
            <span className="text-[9px] font-extrabold tracking-[0.25em] text-indigo-500 dark:text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/10">
              EXPLORATORY DATA ANALYSIS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mt-6 mb-3 tracking-tight">
              Schema & Feature Profiler.
            </h2>
            <p className="text-neutral-500 dark:text-white/40 text-sm leading-relaxed font-light">
              Inspect statistical distributions, detect column associations, and generate correlation grids instantly. All data is processed entirely in the browser sandbox.
            </p>
          </div>

          {/* Premium Animated Upload Dropzone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-xl border-2 border-dashed rounded-4xl p-12 md:p-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 relative group overflow-hidden ${
              isDragOver 
                ? 'border-neutral-800 dark:border-white bg-neutral-50 dark:bg-white/[0.04]' 
                : 'border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.005] hover:bg-neutral-50 dark:hover:bg-white/[0.015] hover:border-neutral-400 dark:hover:border-white/20'
            }`}
          >
            {/* Pulsing glow background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.txt"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center border border-neutral-200 dark:border-white/5 mb-6 group-hover:scale-105 group-hover:shadow-lg transition-all duration-300">
              <UploadSimpleIcon className="w-8 h-8 text-neutral-800 dark:text-white/60 group-hover:text-indigo-500 dark:group-hover:text-white transition-colors" />
            </div>
            <h4 className="text-neutral-800 dark:text-white/80 font-bold mb-2">Drop your dataset here</h4>
            <p className="text-neutral-400 dark:text-white/30 text-xs font-light mb-6">Drag and drop `.csv` or `.txt` columns format</p>
            <button className="bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider px-7 py-3.5 rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 hover:shadow-md transition-all">
              Choose File
            </button>
          </div>

          {/* Quick Sandbox Datasets */}
          <div className="w-full max-w-xl mt-16 border-t border-neutral-200 dark:border-white/5 pt-12 text-center">
            <p className="text-[10px] font-bold text-neutral-400 dark:text-white/30 tracking-[0.2em] uppercase mb-6">
              Or test with pre-loaded mock datasets
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                onClick={() => loadSample('housing')}
                className="bg-white/40 dark:bg-white/5 border border-neutral-200 dark:border-white/5 text-neutral-600 dark:text-white/60 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-950 dark:hover:text-white px-5 py-3.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm hover:shadow-md"
              >
                <DatabaseIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Housing Specs</span>
              </button>
              <button 
                onClick={() => loadSample('students')}
                className="bg-white/40 dark:bg-white/5 border border-neutral-200 dark:border-white/5 text-neutral-600 dark:text-white/60 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-950 dark:hover:text-white px-5 py-3.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm hover:shadow-md"
              >
                <DatabaseIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Student Marks</span>
              </button>
              <button 
                onClick={() => loadSample('sales')}
                className="bg-white/40 dark:bg-white/5 border border-neutral-200 dark:border-white/5 text-neutral-600 dark:text-white/60 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-950 dark:hover:text-white px-5 py-3.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm hover:shadow-md"
              >
                <DatabaseIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Revenue Metrics</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* --- Active Analysis Workspace --- */
        <div className="relative z-10">
          
          {/* Header Metadata Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-200 dark:border-white/10 pb-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  Connected
                </span>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">{fileName}</h2>
              </div>
              <p className="text-neutral-400 dark:text-white/40 text-xs font-light">Exploratory metrics parsed and loaded into local memory</p>
            </div>
            
            <button 
              onClick={handleClear}
              className="flex items-center gap-2 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 text-neutral-500 dark:text-white/60 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-white/10 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <XIcon className="w-3.5 h-3.5" />
              <span>Unload Data</span>
            </button>
          </div>

          {/* Metrics Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statsOverview?.map((stat, idx) => (
              <div key={idx} className="bg-neutral-50 dark:bg-white/[0.01] border border-neutral-200 dark:border-white/5 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-indigo-500 transition-colors duration-300"></div>
                <h5 className="text-neutral-400 dark:text-white/30 text-[9px] font-bold uppercase tracking-wider mb-2">{stat.label}</h5>
                <p className="text-3xl font-bold text-neutral-950 dark:text-white mb-1.5 tracking-tight">{stat.val}</p>
                <p className="text-neutral-400 dark:text-white/40 text-xs font-light">{stat.desc}</p>
              </div>
            ))}
          </div>

          {/* Premium Tab Switcher Layout */}
          <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-white/5 mb-8 overflow-x-auto pb-px">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2.5 px-6 py-4 border-b-2 font-semibold text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'overview' 
                  ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white' 
                  : 'border-transparent text-neutral-400 dark:text-white/40 hover:text-neutral-800 dark:hover:text-white/60'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Data Preview</span>
            </button>
            <button 
              onClick={() => setActiveTab('columns')}
              className={`flex items-center gap-2.5 px-6 py-4 border-b-2 font-semibold text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'columns' 
                  ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white' 
                  : 'border-transparent text-neutral-400 dark:text-white/40 hover:text-neutral-800 dark:hover:text-white/60'
              }`}
            >
              <InfoIcon className="w-4 h-4" />
              <span>Features summary</span>
            </button>
            <button 
              onClick={() => setActiveTab('charts')}
              className={`flex items-center gap-2.5 px-6 py-4 border-b-2 font-semibold text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'charts' 
                  ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white' 
                  : 'border-transparent text-neutral-400 dark:text-white/40 hover:text-neutral-800 dark:hover:text-white/60'
              }`}
            >
              <TrendUpIcon className="w-4 h-4" />
              <span>Plot Visualizations</span>
            </button>
            {analysis && analysis.numericalColumns.length >= 2 && (
              <button 
                onClick={() => setActiveTab('correlation')}
                className={`flex items-center gap-2.5 px-6 py-4 border-b-2 font-semibold text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'correlation' 
                    ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white' 
                    : 'border-transparent text-neutral-400 dark:text-white/40 hover:text-neutral-800 dark:hover:text-white/60'
                }`}
              >
                <GridFourIcon className="w-4 h-4" />
                <span>Correlation Heatmap</span>
              </button>
            )}
          </div>

          {/* --- Tab Content: Overview / Table Preview --- */}
          {activeTab === 'overview' && (
            <div className="w-full">
              <div className="overflow-x-auto border border-neutral-200 dark:border-white/5 rounded-3xl bg-neutral-50/20 dark:bg-white/[0.005]">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-white/10 bg-neutral-100/50 dark:bg-white/[0.015]">
                      {analysis?.headers.map((h, idx) => (
                        <th key={idx} className="p-5 font-bold text-neutral-800 dark:text-white/80 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="tracking-tight text-neutral-950 dark:text-white">{h}</span>
                            <span className={`text-[8px] font-black tracking-widest uppercase mt-1 w-fit px-1.5 py-0.5 rounded ${
                              analysis.columns[idx].type === 'numeric'
                                ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400'
                                : 'bg-amber-500/10 text-amber-500 dark:text-amber-400'
                            }`}>
                              {analysis.columns[idx].type}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(1 + currentPage * rowsPerPage, 1 + (currentPage + 1) * rowsPerPage).map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-neutral-200 dark:border-white/5 last:border-0 hover:bg-neutral-50 dark:hover:bg-white/[0.01] transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-5 text-neutral-500 dark:text-white/55 font-light truncate max-w-[200px]">
                            {cell === '' ? <span className="text-neutral-400 dark:text-white/20 italic font-normal">NaN</span> : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination */}
              {analysis && analysis.rowCount > rowsPerPage && (
                <div className="flex items-center justify-between gap-4 mt-8 flex-wrap">
                  <span className="text-xs text-neutral-400 dark:text-white/40 font-light">
                    Showing <span className="font-semibold text-neutral-800 dark:text-white">{currentPage * rowsPerPage + 1}</span> to <span className="font-semibold text-neutral-800 dark:text-white">{Math.min((currentPage + 1) * rowsPerPage, analysis.rowCount)}</span> of <span className="font-semibold text-neutral-800 dark:text-white">{analysis.rowCount}</span> rows
                  </span>
                  <div className="flex gap-2">
                    <button 
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(c => Math.max(c - 1, 0))}
                      className="bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 text-neutral-600 dark:text-white/60 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none hover:bg-neutral-200 dark:hover:bg-white/10 hover:text-neutral-950 dark:hover:text-white transition-all cursor-pointer"
                    >
                      Prev
                    </button>
                    <button 
                      disabled={(currentPage + 1) * rowsPerPage >= analysis.rowCount}
                      onClick={() => setCurrentPage(c => c + 1)}
                      className="bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 text-neutral-600 dark:text-white/60 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none hover:bg-neutral-200 dark:hover:bg-white/10 hover:text-neutral-950 dark:hover:text-white transition-all cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- Tab Content: Descriptive Statistics --- */}
          {activeTab === 'columns' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis?.columns.map((col, idx) => (
                <div key={idx} className="bg-neutral-50/30 dark:bg-white/[0.005] border border-neutral-200 dark:border-white/5 p-6 rounded-3xl flex flex-col justify-between hover:border-neutral-300 dark:hover:border-white/10 transition-all group duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="text-xl font-bold text-neutral-950 dark:text-white tracking-tight">{col.name}</h4>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        col.type === 'numeric' 
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/10' 
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                      }`}>
                        {col.type}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6 text-xs md:text-sm">
                      {col.type === 'numeric' ? (
                        <>
                          <div className="flex justify-between border-b border-neutral-200/50 dark:border-white/5 pb-2">
                            <span className="text-neutral-400 dark:text-white/40 font-light">Mean</span>
                            <span className="text-neutral-800 dark:text-white/80 font-bold">{col.mean}</span>
                          </div>
                          <div className="flex justify-between border-b border-neutral-200/50 dark:border-white/5 pb-2">
                            <span className="text-neutral-400 dark:text-white/40 font-light">Median</span>
                            <span className="text-neutral-800 dark:text-white/80 font-bold">{col.median}</span>
                          </div>
                          <div className="flex justify-between border-b border-neutral-200/50 dark:border-white/5 pb-2">
                            <span className="text-neutral-400 dark:text-white/40 font-light">Standard Dev (σ)</span>
                            <span className="text-neutral-800 dark:text-white/80 font-bold">{col.stdDev}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400 dark:text-white/40 font-light">Range (Min - Max)</span>
                            <span className="text-neutral-800 dark:text-white/80 font-bold">{col.min} — {col.max}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between border-b border-neutral-200/50 dark:border-white/5 pb-2">
                            <span className="text-neutral-400 dark:text-white/40 font-light">Unique Values</span>
                            <span className="text-neutral-800 dark:text-white/80 font-bold">{col.uniqueValues}</span>
                          </div>
                          <div className="flex justify-between border-b border-neutral-200/50 dark:border-white/5 pb-2">
                            <span className="text-neutral-400 dark:text-white/40 font-light">Top Mode Value</span>
                            <span className="text-neutral-800 dark:text-white/80 font-bold truncate max-w-[170px]">{col.topValue}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400 dark:text-white/40 font-light">Top Mode Frequency</span>
                            <span className="text-neutral-800 dark:text-white/80 font-bold">
                              {col.topFreq} <span className="text-neutral-400 dark:text-white/30 font-normal">({Math.round(((col.topFreq || 0) / analysis.rowCount) * 100)}%)</span>
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-neutral-400 dark:text-white/30 border-t border-neutral-200/50 dark:border-white/5 pt-4 font-medium">
                    <span>Missing Values: {col.missingCount}</span>
                    <span>Rate: {Math.round((col.missingCount / analysis.rowCount) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* --- Tab Content: Visualizations --- */}
          {activeTab === 'charts' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Controls Column */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-neutral-50/20 dark:bg-white/[0.005] border border-neutral-200 dark:border-white/5 p-6 rounded-3xl space-y-5">
                  <h4 className="text-sm font-bold text-neutral-800 dark:text-white/80 uppercase tracking-wider">Plot Control</h4>
                  
                  {/* Selectors */}
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all border ${
                        chartType === 'bar' 
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-950 dark:border-white' 
                          : 'bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-white/60 border-neutral-200 dark:border-white/5 hover:text-neutral-950 dark:hover:text-white'
                      }`}
                    >
                      Bar
                    </button>
                    <button 
                      disabled={analysis?.numericalColumns.length === 0}
                      onClick={() => {
                        setChartType('scatter');
                        if (analysis) {
                          const num = analysis.numericalColumns;
                          setXCol(num[0]);
                          setYCol(num[1] || num[0]);
                        }
                      }}
                      className={`px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all border disabled:opacity-20 disabled:pointer-events-none ${
                        chartType === 'scatter' 
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-950 dark:border-white' 
                          : 'bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-white/60 border-neutral-200 dark:border-white/5 hover:text-neutral-950 dark:hover:text-white'
                      }`}
                    >
                      Scatter
                    </button>
                    <button 
                      disabled={analysis?.numericalColumns.length === 0}
                      onClick={() => {
                        setChartType('line');
                        if (analysis) {
                          setYCol(analysis.numericalColumns[0]);
                        }
                      }}
                      className={`px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all border disabled:opacity-20 disabled:pointer-events-none ${
                        chartType === 'line' 
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-950 dark:border-white' 
                          : 'bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-white/60 border-neutral-200 dark:border-white/5 hover:text-neutral-950 dark:hover:text-white'
                      }`}
                    >
                      Line
                    </button>
                  </div>

                  <div className="h-px bg-neutral-200 dark:bg-white/5"></div>

                  {/* Column Selectors */}
                  {chartType === 'bar' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-neutral-400 dark:text-white/30 tracking-widest uppercase block">Variable (X)</label>
                      <select 
                        value={xCol} 
                        onChange={(e) => setXCol(e.target.value)}
                        className="w-full bg-neutral-100 dark:bg-brand-charcoal border border-neutral-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-neutral-800 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-white transition-colors cursor-pointer"
                      >
                        {analysis?.headers.map((h, idx) => (
                          <option key={idx} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {chartType === 'scatter' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-400 dark:text-white/30 tracking-widest uppercase block">X-Axis Column</label>
                        <select 
                          value={xCol} 
                          onChange={(e) => setXCol(e.target.value)}
                          className="w-full bg-neutral-100 dark:bg-brand-charcoal border border-neutral-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-neutral-800 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-white transition-colors cursor-pointer"
                        >
                          {analysis?.numericalColumns.map((h, idx) => (
                            <option key={idx} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-400 dark:text-white/30 tracking-widest uppercase block">Y-Axis Column</label>
                        <select 
                          value={yCol} 
                          onChange={(e) => setYCol(e.target.value)}
                          className="w-full bg-neutral-100 dark:bg-brand-charcoal border border-neutral-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-neutral-800 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-white transition-colors cursor-pointer"
                        >
                          {analysis?.numericalColumns.map((h, idx) => (
                            <option key={idx} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {chartType === 'line' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-400 dark:text-white/30 tracking-widest uppercase block">Metric (Y-Axis)</label>
                        <select 
                          value={yCol} 
                          onChange={(e) => setYCol(e.target.value)}
                          className="w-full bg-neutral-100 dark:bg-brand-charcoal border border-neutral-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-neutral-800 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-white transition-colors cursor-pointer"
                        >
                          {analysis?.numericalColumns.map((h, idx) => (
                            <option key={idx} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                      <p className="text-[11px] text-neutral-400 dark:text-white/30 font-light leading-relaxed">
                        Line plot maps values sequentially relative to their index positions.
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* Premium Chart Canvas */}
              <div className="lg:col-span-8 bg-neutral-50/20 dark:bg-white/[0.005] border border-neutral-200 dark:border-white/5 p-6 rounded-3xl flex items-center justify-center relative min-h-[360px] overflow-hidden">
                {chartSvgData ? (
                  <div className="relative w-full max-w-[520px]">
                    <svg 
                      viewBox={`0 0 ${chartSvgData.svgWidth} ${chartSvgData.svgHeight}`}
                      className="w-full h-auto select-none"
                    >
                      {/* SVG Visual Gradients Definitions */}
                      <defs>
                        <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.1" />
                        </linearGradient>
                        <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line 
                        x1={chartSvgData.margin.left} 
                        y1={chartSvgData.svgHeight - chartSvgData.margin.bottom} 
                        x2={chartSvgData.svgWidth - chartSvgData.margin.right} 
                        y2={chartSvgData.svgHeight - chartSvgData.margin.bottom} 
                        stroke="rgba(100,116,139,0.15)" 
                        strokeWidth="1"
                      />
                      <line 
                        x1={chartSvgData.margin.left} 
                        y1={chartSvgData.margin.top} 
                        x2={chartSvgData.margin.left} 
                        y2={chartSvgData.svgHeight - chartSvgData.margin.bottom} 
                        stroke="rgba(100,116,139,0.15)" 
                        strokeWidth="1"
                      />

                      {/* Bar Plot */}
                      {chartType === 'bar' && chartSvgData.bars && (
                        <>
                          {chartSvgData.bars.map((bar, idx) => (
                            <g key={idx}>
                              <rect 
                                x={bar.x}
                                y={bar.y}
                                width={bar.width}
                                height={bar.height}
                                fill="url(#barGlow)"
                                stroke="rgba(99,102,241,0.25)"
                                strokeWidth="1"
                                rx="5"
                                className="hover:fill-indigo-500/40 hover:stroke-indigo-500 transition-colors cursor-pointer duration-300"
                                onMouseMove={(e) => handleSvgHover(e, bar.category, bar.val)}
                                onMouseLeave={handleSvgLeave}
                              />
                              <text 
                                x={bar.x + bar.width / 2}
                                y={chartSvgData.svgHeight - chartSvgData.margin.bottom + 18}
                                textAnchor="middle"
                                fill="rgba(100,116,139,0.5)"
                                fontSize="9"
                                className="font-sans font-light truncate max-w-[50px]"
                              >
                                {bar.category.length > 8 ? `${bar.category.slice(0, 6)}..` : bar.category}
                              </text>
                            </g>
                          ))}
                          <text 
                            x={chartSvgData.margin.left - 8}
                            y={chartSvgData.margin.top + 10}
                            textAnchor="end"
                            fill="rgba(100,116,139,0.4)"
                            fontSize="9"
                          >
                            {chartSvgData.maxCount}
                          </text>
                          <text 
                            x={chartSvgData.margin.left - 8}
                            y={chartSvgData.svgHeight - chartSvgData.margin.bottom}
                            textAnchor="end"
                            fill="rgba(100,116,139,0.4)"
                            fontSize="9"
                          >
                            0
                          </text>
                        </>
                      )}

                      {/* Line Plot */}
                      {chartType === 'line' && chartSvgData.pathD && (
                        <>
                          {/* Filled Area Chart */}
                          {chartSvgData.areaD && (
                            <path 
                              d={chartSvgData.areaD}
                              fill="url(#areaGlow)"
                              strokeWidth="0"
                            />
                          )}
                          <path 
                            d={chartSvgData.pathD}
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {chartSvgData.points.map((p, idx) => (
                            <g key={idx}>
                              {/* Outer glow hover dot */}
                              <circle 
                                cx={p.cx}
                                cy={p.cy}
                                r={6.5}
                                fill="#6366f1"
                                opacity="0.15"
                                className="hover:scale-150 transition-all duration-200"
                              />
                              <circle 
                                cx={p.cx}
                                cy={p.cy}
                                r={3.5}
                                fill="rgba(255,255,255,1)"
                                stroke="#6366f1"
                                strokeWidth="2.5"
                                className="hover:r-5 cursor-pointer transition-all duration-200"
                                onMouseMove={(e) => handleSvgHover(e, p.valX, p.valY)}
                                onMouseLeave={handleSvgLeave}
                              />
                            </g>
                          ))}
                          <text 
                            x={chartSvgData.margin.left - 8}
                            y={chartSvgData.margin.top + 8}
                            textAnchor="end"
                            fill="rgba(100,116,139,0.4)"
                            fontSize="9"
                          >
                            {chartSvgData.yMax}
                          </text>
                          <text 
                            x={chartSvgData.margin.left - 8}
                            y={chartSvgData.svgHeight - chartSvgData.margin.bottom}
                            textAnchor="end"
                            fill="rgba(100,116,139,0.4)"
                            fontSize="9"
                          >
                            {chartSvgData.yMin}
                          </text>
                        </>
                      )}

                      {/* Scatter Plot */}
                      {chartType === 'scatter' && chartSvgData.points && (
                        <>
                          {chartSvgData.points.map((p, idx) => (
                            <g key={idx}>
                              <circle 
                                cx={p.cx}
                                cy={p.cy}
                                r={7.5}
                                fill="#6366f1"
                                opacity="0.08"
                              />
                              <circle 
                                cx={p.cx}
                                cy={p.cy}
                                r={3.5}
                                fill="#6366f1"
                                stroke="rgba(255,255,255,0.8)"
                                strokeWidth="1"
                                className="hover:fill-white hover:scale-125 transition-all cursor-pointer duration-150"
                                onMouseMove={(e) => handleSvgHover(e, p.valX, p.valY)}
                                onMouseLeave={handleSvgLeave}
                              />
                            </g>
                          ))}
                          <text 
                            x={chartSvgData.margin.left}
                            y={chartSvgData.svgHeight - chartSvgData.margin.bottom + 18}
                            textAnchor="middle"
                            fill="rgba(100,116,139,0.4)"
                            fontSize="9"
                          >
                            {chartSvgData.xMin}
                          </text>
                          <text 
                            x={chartSvgData.svgWidth - chartSvgData.margin.right}
                            y={chartSvgData.svgHeight - chartSvgData.margin.bottom + 18}
                            textAnchor="middle"
                            fill="rgba(100,116,139,0.4)"
                            fontSize="9"
                          >
                            {chartSvgData.xMax}
                          </text>
                          <text 
                            x={chartSvgData.margin.left - 8}
                            y={chartSvgData.margin.top + 8}
                            textAnchor="end"
                            fill="rgba(100,116,139,0.4)"
                            fontSize="9"
                          >
                            {chartSvgData.yMax}
                          </text>
                          <text 
                            x={chartSvgData.margin.left - 8}
                            y={chartSvgData.svgHeight - chartSvgData.margin.bottom}
                            textAnchor="end"
                            fill="rgba(100,116,139,0.4)"
                            fontSize="9"
                          >
                            {chartSvgData.yMin}
                          </text>
                        </>
                      )}
                    </svg>

                    {/* Custom Floating UI Tooltip */}
                    {hoveredDataPoint && (
                      <div 
                        style={{ 
                          left: `${hoveredDataPoint.svgX}px`, 
                          top: `${hoveredDataPoint.svgY}px`,
                          transform: 'translate(-50%, -100%)' 
                        }}
                        className="absolute bg-neutral-950 dark:bg-white text-white dark:text-black text-[10px] font-bold px-3 py-2 rounded-xl shadow-xl pointer-events-none transition-all duration-75 flex flex-col items-center gap-0.5 border border-white/10 dark:border-black/5"
                      >
                        <span className="opacity-60 text-[8px] uppercase tracking-widest font-black">X: {hoveredDataPoint.x}</span>
                        <span>Val: {hoveredDataPoint.y}</span>
                        <div className="w-1.5 h-1.5 bg-neutral-950 dark:bg-white rotate-45 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-r border-b border-white/10 dark:border-black/5"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-neutral-400 dark:text-white/30 text-xs italic">Awaiting axis fields...</p>
                )}
              </div>
            </div>
          )}

          {/* --- Tab Content: Correlation Heatmap --- */}
          {activeTab === 'correlation' && correlations && (
            <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-neutral-50/20 dark:bg-white/[0.005] border border-neutral-200 dark:border-white/5 rounded-3xl min-h-[360px]">
              <div className="w-full max-w-xl">
                <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 text-center tracking-tight">
                  Pearson Correlation Matrix
                </h4>
                <p className="text-neutral-500 dark:text-white/40 text-xs font-light text-center mb-10 leading-relaxed max-w-xs mx-auto">
                  Measures feature linear combinations. Intensity represents correlation strengths (-1 to +1).
                </p>

                {/* Heatmap Grid */}
                <div className="flex flex-col gap-2">
                  {/* Grid header labels */}
                  <div className="flex gap-2 items-center">
                    <div className="w-24 shrink-0"></div>
                    {analysis?.numericalColumns.map((col, idx) => (
                      <div key={idx} className="flex-1 text-center text-[10px] font-extrabold text-neutral-400 dark:text-white/40 uppercase tracking-widest truncate py-1">
                        {col.length > 8 ? `${col.slice(0, 6)}.` : col}
                      </div>
                    ))}
                  </div>

                  {/* Grid content rows */}
                  {analysis?.numericalColumns.map((rowCol, rIdx) => (
                    <div key={rIdx} className="flex gap-2 items-center">
                      <div className="w-24 shrink-0 text-right pr-4 text-[10px] font-extrabold text-neutral-400 dark:text-white/40 uppercase tracking-widest truncate">
                        {rowCol.length > 8 ? `${rowCol.slice(0, 6)}.` : rowCol}
                      </div>

                      {analysis.numericalColumns.map((colCol, cIdx) => {
                        const r = correlations[rowCol]?.[colCol] ?? 0;
                        const rAbs = Math.abs(r);

                        // Dynamic colors based on values
                        let bgStyle = 'text-neutral-600 dark:text-white/40 border-neutral-200 dark:border-white/5';
                        if (r > 0) bgStyle = `text-emerald-900 dark:text-emerald-300 border-emerald-500/20`;
                        else if (r < 0) bgStyle = `text-rose-900 dark:text-rose-300 border-rose-500/20`;

                        const cellStyle = r === 1 
                          ? { backgroundColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)' } 
                          : r > 0 
                            ? { backgroundColor: `rgba(16,185,129,${rAbs * 0.35})` } 
                            : { backgroundColor: `rgba(244,63,94,${rAbs * 0.35})` };

                        return (
                          <div 
                            key={cIdx} 
                            style={cellStyle}
                            className={`flex-1 text-center py-4 rounded-2xl text-xs font-bold border transition-all cursor-help relative group/cell hover:scale-105 hover:shadow-md ${bgStyle}`}
                          >
                            {r}
                            {/* Cell custom tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-neutral-950 text-white text-[9px] font-bold px-2 py-1 rounded-md opacity-0 pointer-events-none group-hover/cell:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20">
                              r({rowCol}, {colCol}) = {r}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Heatmap Legend */}
                <div className="flex items-center justify-center gap-6 mt-12 text-[9px] font-bold text-neutral-400 dark:text-white/30 tracking-widest uppercase">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-lg bg-rose-500/30 border border-rose-500/10"></div>
                    <span>Inverse (-r)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-lg bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/5"></div>
                    <span>Neutral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-lg bg-emerald-500/30 border border-emerald-500/10"></div>
                    <span>Direct (+r)</span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
