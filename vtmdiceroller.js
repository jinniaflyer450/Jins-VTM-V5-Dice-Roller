//First, a function to roll 1 die with sides number of sides.

const dx = sides => (Math.ceil((Math.random() * sides)))


//Second, a function to roll num dice with sides number of sides.

function ndx(num, sides){
    const rollResults = []
    for(let i = 1; i <= num; i++){
        rollResults.push(dx(sides))
    }
    return rollResults
}

//For a VtM V5 dice roller, we always use d10s. However, we need two groups of d10s--hunger dice and regular dice. ndx can roll both.

function convertHunger(totalPool, hunger){
    if(hunger >= totalPool){
        hungerDice = totalPool
        normalDice = 0
    }
    else{
        hungerDice = hunger
        normalDice = totalPool - hunger
    }
    return [normalDice, hungerDice] 
}

const getRawNormalResults = normalDice => ndx(normalDice, 10)

const getRawHungerResults = hungerDice => ndx(hungerDice, 10)

function convertRawNormalResults(rawNormalResults){
    const convertedNormalResults = {'fail': 0, 'success': 0, 'potCrit': 0}
    for(result of rawNormalResults){
        if(result < 6){
            convertedNormalResults.fail++
        }
        else if(result >= 6 && result < 10 ){
            convertedNormalResults.success++
        }
        else{
            convertedNormalResults.potCrit++
        }
    }
    return convertedNormalResults
}

function convertRawHungerResults(rawHungerResults){
    const convertedHungerResults = {'potBestial': 0, 'fail': 0, 'success': 0, 'potMess': 0}
    for(result of rawHungerResults){
        if(result === 1){
            convertedHungerResults.potBestial++
        }
        else if(result > 1 && result < 6){
            convertedHungerResults.fail++
        }
        else if(result >= 6 && result < 10){
            convertedHungerResults.success++
        }
        else{
            convertedHungerResults.potMess++
        }
    }
    return convertedHungerResults
}

function getConvertedRollResults(totalPool, hunger){
    const diceNums = convertHunger(totalPool, hunger)
    const rawNormalResults = getRawNormalResults(diceNums[0], 10)
    const rawHungerResults = getRawHungerResults(diceNums[1], 10)
    const convertedNormalResults = convertRawNormalResults(rawNormalResults)
    const convertedHungerResults = convertRawHungerResults(rawHungerResults)
    const totalResults = {}
    totalCrits = convertedNormalResults.potCrit + convertedHungerResults.potMess
    if(convertedHungerResults.potBestial){
        totalResults.bestial = true
    }
    totalResults.fail = convertedNormalResults.fail + convertedHungerResults.fail + convertedHungerResults.potBestial
    totalResults.success = convertedNormalResults.success + convertedHungerResults.success
    if(totalCrits > 1 && convertedHungerResults.potMess > 0){
        totalResults.messyCrit = true
        totalResults.success += (2*(totalCrits - totalCrits%2)) + totalCrits%2
    }
    else if(totalCrits > 1){
        totalResults.normalCrit = true
        totalResults.success += (2*(totalCrits - totalCrits%2)) + totalCrits%2
    }
    else if(totalCrits === 1){
        totalResults.success += totalCrits
    }
    totalResults.rawNormalResults = rawNormalResults
    totalResults.rawHungerResults = rawHungerResults
    return totalResults
}

function v5Roll(totalPool, hunger, diff){
    let totalResults = getConvertedRollResults(totalPool, hunger)
    if(totalResults.success >= diff && totalResults.messyCrit){
        return `Messy Critical--rolled ${totalResults.rawNormalResults} on normal dice and ${totalResults.rawHungerResults} on Hunger dice, translating to ${totalResults.success} success(es) against a difficulty of ${diff}.`
    }
    else if(totalResults.success >= diff && totalResults.normalCrit){
        return `Normal Critical--rolled ${totalResults.rawNormalResults} on normal dice and ${totalResults.rawHungerResults} on Hunger dice, translating to ${totalResults.success} success(es) against a difficulty of ${diff}.`
    }
    else if(totalResults.success >= diff){
        return `Success--rolled ${totalResults.rawNormalResults} on normal dice and ${totalResults.rawHungerResults} on Hunger dice, translating to ${totalResults.success} success(es) against a difficulty of ${diff}.`
    }
    else if(totalResults.success < diff && totalResults.bestial){
        return `Bestial Failure--rolled ${totalResults.rawNormalResults} on normal dice and ${totalResults.rawHungerResults} on Hunger dice, translating to ${totalResults.success} success(es) against a difficulty of ${diff}.`
    }
    else{
        return `Failure--rolled ${totalResults.rawNormalResults} on normal dice and ${totalResults.rawHungerResults} on Hunger dice, translating to ${totalResults.success} success(es) against a difficulty of ${diff}.`
    }
}

document.addEventListener('submit', function(e){
    e.preventDefault()
    let totalPool = document.querySelector('#total-pool').value
    let hunger = document.querySelector('#hunger').value
    let difficulty = document.querySelector('#difficulty').value
    let newRoll = document.createElement('p')
    newRoll.innerText = v5Roll(totalPool, hunger, difficulty)

    document.querySelector('#roll-results').append(newRoll)
})