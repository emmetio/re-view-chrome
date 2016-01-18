'use strict';

module.exports = function(title) {
    return err => {
        if (process.platform === 'darwin') {
            cp.exec(`osascript -e 'display notification "${err.message}" with title "${title}"'`);
        }
    };
};
