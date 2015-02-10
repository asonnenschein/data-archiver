function CSW (url) {
  if (!url) throw new Error('URL is required!');
  this.url = url;
  this.namespaces = {
    'csw': 'http://www.opengis.net/cat/csw/2.0.2',
    'ogc': 'http://www.opengis.net/ogc',
    'ows': 'http://www.opengis.net/ows',
    'xlink': 'http://www.w3.org/1999/xlink'
  };
}

module.exports = CSW;