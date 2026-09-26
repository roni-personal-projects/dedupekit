// DeDupe Kit - High-Performance Web Worker for Background Deduplication
// Completely isolated from main thread for 60fps performance on 100k+ lines

self.onmessage = function (e) {
  const {
    text,
    caseSensitive = false,
    preserveCasing = true,
    trimWhitespace = 'both', // 'none' | 'both' | 'start' | 'end'
    blankLines = 'remove', // 'remove' | 'preserve' | 'single'
    sortOrder = 'original', // 'original' | 'az' | 'za' | 'natural' | 'length-asc' | 'length-desc' | 'reverse'
    filterMode = 'unique', // 'unique' | 'duplicates-only' | 'unique-once' | 'frequency'
    columnDelimiter = 'none', // 'none' | 'auto' | '\t' | ',' | ';' | '|'
    columnIndex = 0 // 0-based column index if delimiter mode enabled
  } = e.data;

  const startTime = performance.now();

  if (!text || text.length === 0) {
    self.postMessage({
      output: '',
      stats: {
        totalLines: 0,
        uniqueLines: 0,
        duplicatesRemoved: 0,
        reductionPercent: 0,
        charCount: 0,
        durationMs: 0
      }
    });
    return;
  }

  // Split lines (supporting Windows \r\n, Unix \n, and Mac \r)
  const rawLines = text.split(/\r\n|\r|\n/);
  const totalLines = rawLines.length;

  // Step 1: Pre-process and normalize keys for matching
  const lineRecords = [];
  let blankCount = 0;

  for (let i = 0; i < totalLines; i++) {
    let raw = rawLines[i];
    let processed = raw;

    // Whitespace trimming
    if (trimWhitespace === 'both') {
      processed = raw.trim();
    } else if (trimWhitespace === 'start') {
      processed = raw.trimStart();
    } else if (trimWhitespace === 'end') {
      processed = raw.trimEnd();
    }

    const isBlank = processed.length === 0;

    if (isBlank) {
      blankCount++;
      if (blankLines === 'remove') {
        continue;
      }
      if (blankLines === 'single' && blankCount > 1) {
        continue;
      }
    }

    // Determine comparison key
    let comparisonKey = processed;

    // Handle column-based deduplication if selected
    if (columnDelimiter !== 'none') {
      let sep = columnDelimiter;
      if (sep === 'auto') {
        if (processed.includes('\t')) sep = '\t';
        else if (processed.includes(',')) sep = ',';
        else if (processed.includes(';')) sep = ';';
        else sep = '';
      }

      if (sep) {
        const parts = processed.split(sep);
        if (columnIndex < parts.length) {
          comparisonKey = parts[columnIndex];
        }
      }
    }

    if (!caseSensitive) {
      comparisonKey = comparisonKey.toLowerCase();
    }

    // Value to output: if case-sensitive or not preserving casing, use processed. If preserving casing, keep original processed.
    let displayValue = processed;
    if (!caseSensitive && !preserveCasing) {
      displayValue = processed.toLowerCase();
    }

    lineRecords.push({
      originalIndex: i,
      displayValue: displayValue,
      comparisonKey: comparisonKey,
      isBlank: isBlank
    });
  }

  // Step 2: Track frequencies and unique occurrences using Map for O(N) performance
  const occurrenceMap = new Map(); // comparisonKey -> { count: number, firstRecord: object, allRecords: [] }
  const orderedUnique = [];

  for (let i = 0; i < lineRecords.length; i++) {
    const rec = lineRecords[i];
    const key = rec.comparisonKey;

    if (occurrenceMap.has(key)) {
      const entry = occurrenceMap.get(key);
      entry.count++;
      entry.allRecords.push(rec);
    } else {
      const entry = {
        count: 1,
        firstRecord: rec,
        allRecords: [rec]
      };
      occurrenceMap.set(key, entry);
      orderedUnique.push(entry);
    }
  }

  // Step 3: Filter according to filterMode
  let resultEntries = [];

  if (filterMode === 'unique') {
    // Normal deduplication (keep first occurrence)
    resultEntries = orderedUnique.map(e => ({
      text: e.firstRecord.displayValue,
      originalIndex: e.firstRecord.originalIndex,
      count: e.count
    }));
  } else if (filterMode === 'duplicates-only') {
    // Return only keys that had duplicates (count > 1)
    resultEntries = orderedUnique
      .filter(e => e.count > 1)
      .map(e => ({
        text: e.firstRecord.displayValue,
        originalIndex: e.firstRecord.originalIndex,
        count: e.count
      }));
  } else if (filterMode === 'unique-once') {
    // Return only lines that were never duplicated (count === 1)
    resultEntries = orderedUnique
      .filter(e => e.count === 1)
      .map(e => ({
        text: e.firstRecord.displayValue,
        originalIndex: e.firstRecord.originalIndex,
        count: 1
      }));
  } else if (filterMode === 'frequency') {
    // Return line with occurrence count
    resultEntries = orderedUnique.map(e => ({
      text: `${e.firstRecord.displayValue} [${e.count}x]`,
      originalIndex: e.firstRecord.originalIndex,
      count: e.count
    }));
  }

  // Step 4: Sorting
  if (sortOrder === 'az') {
    resultEntries.sort((a, b) => a.text.localeCompare(b.text, undefined, { sensitivity: caseSensitive ? 'variant' : 'base' }));
  } else if (sortOrder === 'za') {
    resultEntries.sort((a, b) => b.text.localeCompare(a.text, undefined, { sensitivity: caseSensitive ? 'variant' : 'base' }));
  } else if (sortOrder === 'natural') {
    resultEntries.sort((a, b) => a.text.localeCompare(b.text, undefined, { numeric: true, sensitivity: 'base' }));
  } else if (sortOrder === 'length-asc') {
    resultEntries.sort((a, b) => a.text.length - b.text.length || a.text.localeCompare(b.text));
  } else if (sortOrder === 'length-desc') {
    resultEntries.sort((a, b) => b.text.length - a.text.length || a.text.localeCompare(b.text));
  } else if (sortOrder === 'reverse') {
    resultEntries.reverse();
  }
  // 'original' preserves insertion order, no sort needed

  const outputLines = resultEntries.map(e => e.text);
  const output = outputLines.join('\n');
  const uniqueCount = outputLines.length;
  const duplicatesRemoved = totalLines - uniqueCount;
  const reductionPercent = totalLines > 0 ? Math.round((duplicatesRemoved / totalLines) * 100) : 0;
  const durationMs = Math.round(performance.now() - startTime);

  self.postMessage({
    output: output,
    stats: {
      totalLines: totalLines,
      uniqueLines: uniqueCount,
      duplicatesRemoved: Math.max(0, duplicatesRemoved),
      reductionPercent: Math.max(0, reductionPercent),
      charCount: output.length,
      durationMs: durationMs
    }
  });
};
