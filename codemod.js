module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;

  return j(fileInfo.source)
    .find(j.Literal)
    .forEach(path => {
      const value = path.value.value;
      if (typeof value === 'string') {
        // Replace text-gray-* and bg-gray-*
        path.value.value = value.replace(/text-gray-(\d+)/g, 'text-$1').replace(/bg-gray-(\d+)/g, 'bg-$1');
        // Example: converting hard-coded color #f9e7c9 to semantic token
        path.value.value = value.replace('#f9e7c9', 'bg-[hsl(var(--bb-champagne))]');
      }
    })
    .toSource();
};

