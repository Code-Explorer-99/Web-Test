// Const associated to the html buttons
const connectButton = document.querySelector('#connectButton')
const disconnectButton = document.querySelector('#disconnectButton')

// Array associated with the ble services and characteristics used
//const BLE_SERVICES = ['heart_rate']
//const BLE_CHARACTERISTICS = ['heart_rate_measurement']
const BLE_SERVICES = [0x9800]
const BLE_CHARACTERISTICS = [0x9801, 0x9802]
const N_SERVICES = BLE_SERVICES.length
const N_CHARACTERISTICS = BLE_CHARACTERISTICS.length


// Array associated to the data to be displayed
const dataSelectorArray = [

    voltageSelectors = [
        voltage24 = document.querySelector('#v24'),
        voltage12  = document.querySelector('#v12'),
        /*voltage6   = document.querySelector('#v6'),
        voltage5   = document.querySelector('#v5'),
        voltage3_3 = document.querySelector('#v3_3')*/
    ]/*,

    tempSelector = [
        tCore = document.querySelector('#tCore'),
        tSense1 = document.querySelector('#tSense1'),
        tSense2 = document.querySelector('#tSense2')
    ],

    tcSelector = [
        tc1 = document.querySelector('#tc1'),
        tc2 = document.querySelector('#tc2'),
        tc3 = document.querySelector('#tc3'),
        tc4 = document.querySelector('#tc4'),
        tc5 = document.querySelector('#tc5'),
        tc6 = document.querySelector('#tc6')
    ],

    pressureSelector = [
        pr1 = document.querySelector('#pr1'),
        pr2 = document.querySelector('#pr2'),
        pr3 = document.querySelector('#pr3'),
        pr4 = document.querySelector('#pr4'),
    ],

    lambdaSelector = [
        ch1 = document.querySelector('#ch1'),
        ch2 = document.querySelector('#ch2')
    ]*/
]

const valueHandlerArray = [

    voltageHandler = [handle_uint8]

] // it's an array of array defining the type of data of the ble characteristic

let bleDevice
let bleDataSources = [] // it's an array of objects where each object is formed by a serviceUUID, a charUUID a target selector and a valueHandler

disconnectButton.disabled = true

/**************************************************************************/
// Handle functions to manage the data update to the html DOM

function handle_uint8(event, dataSelector)
{
    const value = event.target.value.getUint8(0, false)
    dataSelector.textContent = value
}

function handle_uint16(event, dataSelector)
{
    const value = event.target.value.getUint16(0, false)
    dataSelector.textContent = value
}

function handle_int16(event, dataSelector)
{
    const value = event.target.value.getInt16(0, false)
    dataSelector.textContent = value
}

function handle_float32(event, dataSelector)
{
    const value = event.target.value.getFloat32(0, false)
    dataSelector.textContent = value
}

/**************************************************************************/

function isWebBLEAvailable()
{
    if(!navigator.bluetooth)
        {
            Swal.fire({
                title: "Comunicazione Bluetooth non supportata da questo browser!",
                confirmButtonColor: '#344C64',
              });
            return false
        }
    return true
}

/**************************************************************************/

for (let i = 0; i < N_SERVICES; i++)
    {
        for (let j = 0; j < N_CHARACTERISTICS; j++)
            {
                bleDataSources.push({bleServiceUUID: BLE_SERVICES[i], bleCharUUID: BLE_CHARACTERISTICS[j],
                                     dataSelector: dataSelectorArray[i][j], valueHandler: valueHandlerArray[i][j]})
            }
    }

/**************************************************************************/

function connectDevice(bleDevice, bleServiceUUID, bleCharUUID, dataSelector, valueHandler)
{
    bleDevice.gatt.connect() // connection to the gatt server
    .then(server =>{
        console.log('Connected to the gatt server')
        return server.getPrimaryService(bleServiceUUID) // connection to the service of the device
    })
    .then(service => {
        console.log('Connected to the primary service')
        return service.getCharacteristic(bleCharUUID)}) // connection to the characteristic of the device
    .then(characteristic => {
        console.log('Connected to the characteristic')
        connectButton.textContent = 'Connected'
        disconnectButton.disabled = false
        connectButton.disabled = true
        return characteristic.startNotifications()})
    .then(characteristic => characteristic.addEventListener('characteristicvaluechanged', function(event) {valueHandler(event, dataSelector)}))
}

/**************************************************************************/

function requestDevice() {
    navigator.bluetooth.requestDevice({ filters: [{ services: BLE_SERVICES }] })
        .then(device => {
            bleDevice = device
            bleDevice.addEventListener('gattserverdisconnected', onDisconnected)
            connectButton.textContent = 'Connecting ...'
            bleDataSources.forEach(source => {
                connectDevice(device, source.bleServiceUUID, source.bleCharUUID, source.dataSelector, source.valueHandler)    
            })
        })
        .catch(error => {
            console.error('Bluetooth device selection or connection failed', error);
        });
}

/**************************************************************************/

function onDisconnected(event) {
    // Object event.target is Bluetooth Device getting disconnected.
    console.log('Bluetooth Device disconnected')
   
    connectButton.disabled = false
    connectButton.textContent = 'Connect'
    disconnectButton.disabled = true
    Swal.fire({
        title: "Dispositivo Bluetooth disconnesso",
        confirmButtonColor: '#344C64',
      });
    clearTextBoxes()
  }

/**************************************************************************/

function clearTextBoxes()
{
    for (let i = 0; i < N_SERVICES; i++)
        {
            for (let j = 0; j < N_CHARACTERISTICS; j++)
                {
                    dataSelectorArray[i][j].textContent = '---'
                }
        }
}

/**************************************************************************/  

function init()
{
    if(isWebBLEAvailable())
    {
        requestDevice()
    }
}

function disconnect()
{
    if(bleDevice.gatt.connected)
        {
           bleDevice.gatt.disconnect()
           console.log('Disconnected from the device')
           connectButton.disabled = false
           connectButton.textContent = 'Connect'
           disconnectButton.disabled = true
           clearTextBoxes()
        }
}

connectButton.addEventListener('click', init)
disconnectButton.addEventListener('click', disconnect)
