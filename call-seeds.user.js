// ==UserScript==
// @name          nnm-club^anime call seeds
// @namespace     nnm-club^anime.Scripts
// @description   Призыв скачавших по раздачам в профиле
// @version       1.0.0.0
// @author        ElSwanko
// @homepage      https://github.com/ElSwanko/nnm-club-anime
// @updateURL     https://github.com/ElSwanko/nnm-club-anime/raw/master/call-seeds.meta.js
// @downloadURL   https://github.com/ElSwanko/nnm-club-anime/raw/master/call-seeds.user.js
// @match         *://*.nnmclub.to/forum/profile.php?mode=viewprofile*
// @match         *://*.nnm-club.me/forum/profile.php?mode=viewprofile*
// @match         *://*.nnm-club.name/forum/profile.php?mode=viewprofile*
// @match         *://dsenxis5txr4zbxe.onion/forum/profile.php?mode=viewprofile*
// @grant         none
// ==/UserScript==
//

function SeedsCaller() {

    const baseURI = document.baseURI.split('?')[0].replace('profile', 'call_seed');
    let start = null;
    let tr = null;
    let xhr = new XMLHttpRequest();

    function drawLink() {
        const tds = document.body.querySelectorAll('td[colspan="7"]')
        if (tds.length >= 2) {
            start = tds[1].parentElement.nextElementSibling;
            start.children[2].innerHTML = '' +
                '<span class="genmed">' +
                '<a class="genmed" href="javascript:;" onclick="seedsCaller.callSeeds();"><b>Позвать всех скачавших</b></a>' +
                '</span>';
            tr = start.nextElementSibling;
        } else {
            console.log('DL part not loaded yet');
            setTimeout(drawLink, 1000);
        }
    }

    function callSeeds() {
        let a = tr.querySelector('a[class="genmed"]');
        if (a != null) {
            try {
                const url = baseURI + '?' + a.href.split('?')[1]
                xhr.open('GET', url, false);
                xhr.send();
                console.log('Called seeds on ' + a.text + ' with ' + url);
            } catch (e) {
                console.error('Failed to call seeds on ' + a, e)
            }
            tr = tr.nextElementSibling;
            setTimeout(callSeeds, 1000);
        }
    }

    return {
        drawLink: drawLink,
        callSeeds: callSeeds
    }
}

const script = document.createElement('script');
const textContent = SeedsCaller.toString() + ' const seedsCaller = SeedsCaller(); seedsCaller.drawLink();'
script.textContent = textContent;
document.body.appendChild(script);
