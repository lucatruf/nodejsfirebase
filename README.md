# Simple nodejs to update Firebase DB

This code search for active and visible bluetooth devices and writes their addresses and names to a Firebase DB.
This code uses [node bluetooth serial port](https://github.com/eelcocramer/node-bluetooth-serial-port/).
So clone the repository in this same diretory so it can be used.

## RRELEASE NOTES

### 0.1.0

* Sample code created to do a demo of Firebase functionality at the 2015 edition of [Mokapp](http://mokapp.com/) mobile conference 

## Insrtall 

```
npm install bluetooth-serial-port
npm install firebase --save
```

## Usage
`node bt.js`

## LICENSE

This module is available under a [FreeBSD license](http://opensource.org/licenses/BSD-2-Clause), see the LICENSE file for details.

