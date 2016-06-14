module.exports = {
    hidePartOfNumber: function(number) {
        return number.slice(4 - number.length) + '****';
    }
};