export const CITY_SIZE = 44;
export const MAKER_POSITION = [-7, 0, 7];
export const CITY_BLOCKS = [
  [-7,-7,4.4,4.4,5.4,'#aec8d0'], [7,-7,4.4,4.4,7,'#e8bc9d'],
  [7,7,4.4,4.4,4.5,'#b7c9b2'], [-19,-7,3,4,4,'#d8c2a4'],
  [19,-7,3,4,6,'#a3bdce'], [-19,7,3,4,5,'#c3b8d3'],
  [19,7,3,4,3.8,'#e7b4a4'], [-7,19,4,3,4.8,'#b0c6be'],
  [7,19,4,3,6.2,'#d1c3aa'], [-7,-19,4,3,3.8,'#bdcce0'],
  [7,-19,4,3,4.6,'#d6bbac'],
].map(([x,z,width,depth,height,color])=>({x,z,width,depth,height,color}));
export const LAMP_POSITIONS = [[-3.8,-9],[3.8,9],[-9,3.8],[9,-3.8],[-16,-10],[16,10],[-10,16],[10,-16]];
