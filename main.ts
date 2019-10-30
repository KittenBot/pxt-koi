/*
Riven
load dependency
"koi": "file:../pxt-koi"
*/

//% color="#5c7cfa" weight=10 icon="\u03f0"
namespace koi {


    const PortSerial = [
        [SerialPin.P8, SerialPin.P0],
        [SerialPin.P12, SerialPin.P1],
        [SerialPin.P13, SerialPin.P2],
        [SerialPin.P15, SerialPin.P14]
    ]

    export enum SerialPorts {
        PORT1 = 0,
        PORT2 = 1,
        PORT3 = 2,
        PORT4 = 3
    }

    function trim(n: string):string {
        while (n.charCodeAt(n.length-1)<0x1f) {
            n = n.slice(0, n.length-1)
        }
        return n;
    }

    serial.onDataReceived('\n', function () {
        let a = serial.readString()
        if (a.charCodeAt(0) > 0x1f) {
            console.log(">>" + a)
        }

    })

    /**
     * init serial port
     * @param tx Tx pin; eg: SerialPin.P1
     * @param rx Rx pin; eg: SerialPin.P2
    */
    //% blockId=koi_init block="KOI init|Tx pin %tx|Rx pin %rx"
    //% weight=100
    export function koi_init(tx: SerialPin, rx: SerialPin): void {
        serial.redirect(
            tx,
            rx,
            BaudRate.BaudRate9600
        )
        basic.pause(100)
        serial.setTxBufferSize(64)
        serial.setRxBufferSize(64)
        serial.readString()
        serial.writeString('\n\n')
        basic.pause(1000)
    }

    //% blockId=koi_init_pw block="KOI init powerbrick|Port %port"
    //% weight=100
    export function koi_init_pw(port: SerialPorts): void {
        koi_init(PortSerial[port][1], PortSerial[port][0]);
    }

}
