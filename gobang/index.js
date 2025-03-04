// 封装 Gobang 类
var Gobang = (function () {

    // 定义私有变量 roundDirectArr
    // 方向数组
    //[1,1][-1,1][0,1][-1,0]
    var arr = [1, -1, 0]
    var roundDirectArr = []
    arr.forEach(v => roundDirectArr.push([v, 1]))
    roundDirectArr.push([-1, 0])

    // 定义 Gobang 的方法集
    class GobangUtil {
        //取属性值
        getProps(x, y) {
            return 'x' + x + 'y' + y
        }

        //在棋盘取颜色
        getColor(board, x, y) {
            return board[this.getProps(x, y)]
        }

        // 返回每个方向的颜色值相同的棋子数
        getNumberOfCoinsInAllDirectionWithSameColor(x, y, board, direction) {
            var result = 0
            var bindGetcolor = this.getColor.bind(this, board)
            var targetColor = bindGetcolor(x, y)

            for (var i = 1; i < 5; i++) {
                var nextColortoCheck = bindGetcolor(x + i * direction[0], y + i * direction[1])
                if (targetColor == nextColortoCheck) {
                    result++
                } else {
                    break
                }
            }
            return result
        }

        // 判断单个轴(两个方向)是否成立
        checkSingleLineDirection(x, y, board, direction) {
            var leftDirect = direction
            var rightDirect = direction.map(v => -v) //反过来
            var getNum = this.getNumberOfCoinsInAllDirectionWithSameColor.bind(this, x, y, board)

            //胜利条件 五子连珠（左侧数量 + 右侧数量）1 为本身
            return (getNum(leftDirect) + 1 + getNum(rightDirect)) >= 5
        }

        // 判断 4 个轴中是否有一个成立
        checkFourDirections(x, y, board, roundDirect) {
            return roundDirect.some(direction => this.checkSingleLineDirection(x, y, board, direction))
        }
    }

    // 定义 Gobang
    class Gobang extends GobangUtil {
        constructor(callback) {
            super()
            //对象，每个属性为已下棋子的坐标，属性值为该坐标的颜色值；
            var board = new Proxy({}, {
                get: function (target, property) {
                    if (property in target) {
                        return target[property];
                    } else {
                        return 0
                    }
                }
            })

            this.board = board
            this.callback = callback
            this.playChess = this.palyChess.bind(this)
        }

        //方法，是执行下棋的调用方法，参数分别为 x，y 坐标值与要下棋子的颜色值；
        palyChess(x, y, coinColor) {

            this.board[super.getProps(x, y, coinColor)] = coinColor

            var isWin = super.checkFourDirections(x, y, this.board, roundDirectArr)
            isWin ? this.callback.end(coinColor) : this.callback.keep(coinColor)
        }
    }

    return Gobang
})()


var Game = (function () {
    var chessColor = 2
    var isWin = false
    var ele = document.getElementById('root')

    function instantGobang(onEnd, onKeep) {
        // 生成 Gobang 实例，定义游戏结束与继续事件
        var mygobang = new Gobang({
            //两个回调函数

            //落子后 游戏胜利结束
            end(color) {
                onEnd(color)
                isWin = true
            },
            //落子后 游戏继续的回调事件
            keep(color) {
                onKeep(color)
            }
        })

        return mygobang
    }

    function renderTpl(size) {
        var tpl,
            coordArr = [],
            htm = '',
            arr = [...Array(size).keys()]

        rwidth = ele.clientWidth
        // console.log(rwidth)
        swidth = parseInt((rwidth / size), 10) + 'px'
        cwidth = parseInt((rwidth / size / 1.2), 10) + 'px'

        tpl = (coord, color) => (`
            <div class="square" style="width:${swidth};height:${swidth}">
                <div class="circle ${color ? color : ''}" data-coord="${coord}" style="width:${cwidth};height:${cwidth}"></div>
            </div>
        `)

        arr.forEach(v => arr.forEach(e => htm += tpl([e, v])))

        return htm
    }

    function renderHtm(tpl) {
        ele.innerHTML = tpl
    }

    function bindEvent(mygobang) {
        ele.addEventListener('click', (e) => {
            if (isWin) {
                return
            }
            var target = e.target
            if (target.className.includes('circle') && target.classList.length == 1) {
                chessColor = 3 - chessColor
                var coord = target.getAttribute('data-coord').split(',')
                target.classList.add(chessColor == 1 ? 'white' : 'black')
                mygobang.palyChess(+coord[0], +coord[1], chessColor)
            }
        })
    }

    return {
        start(size, {onEnd, onKeep}) {
            // 渲染棋盘
            renderHtm(renderTpl(size))

            // 生成 gobang 实例并绑定事件
            bindEvent(instantGobang(onEnd, onKeep))
        }
    }
})()






