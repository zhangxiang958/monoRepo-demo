const demo = require('@pkg/demo')

console.log(demo.say())

function say2 () {
    console.log('demo2');
}

module.exports = {
    say2
}
