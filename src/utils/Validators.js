
export function checkSpecialCharacter(comments) {
    var format = /^[a-zA-Z\d\-_.,:?*$@\s]+$/;
    return !format.test(comments);
}