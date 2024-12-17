for (var i=0; i<10; i++) {
 try {
 continue;
 }
 finally {
 console.log( i );
 }
}
// 0 1 2 3 4 5 6 7 8 9