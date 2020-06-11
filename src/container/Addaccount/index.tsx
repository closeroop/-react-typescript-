import React, { Component } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import Swiper from 'react-id-swiper'

import style from './index.module.scss'
import 'swiper/css/swiper.css'

import AccountItem from './../../components/AccountItem'
import AccountSwiper from './../../components/AccountSwiper'
import KeyBoard from './../../components/KeyBoard'
import Tab, { TabItem } from './../../components/AccountTab'

import ItemList from './../../moke/categories'
import { paymentType as PaymentType } from './../../components/AccountItem/index'
import { IconProps } from './../../components/AccountSwiper/index'

type IconArr = IconProps

interface Istate {
	id: number | string
	paymentType: PaymentType
	moeny: string
	category: string
	icon: keyof typeof IconType
	time: number
}

type IstateUnite = {
	income: Istate
	outcome: Istate
	currentSwiper: number
}

interface IqueryProps {
	type: string // 0-new 1-outcome 2-income
	[index: string]: string
}

const iconArr = ItemList as IconArr[]
let swiperEl: any

class Addaccount extends Component<RouteComponentProps, IstateUnite> {
	incomeCategories: IconArr[] = []
	outcomeCategories: IconArr[] = []
	moneyMaxLength: number
	swiperParams: any
	queryData: any
	constructor(props: RouteComponentProps) {
		super(props)
		this.state = {
			income: {
				id: '',
				paymentType: 1,
				moeny: '',
				category: '',
				icon: 'food',
				time: 0,
			},
			outcome: {
				id: '',
				paymentType: 2,
				moeny: '',
				category: '',
				icon: 'food',
				time: 0,
			},
			currentSwiper: 0, // 后期路由判断
		}
		this.moneyMaxLength = 9
		this.breakCategory()
		this.queryData = tools.parseUrlSearch(this.props.location.search)
		this.swiperParams = {
			containerClass: style.swiperContainer,
			getSwiper($el: any) {
				swiperEl = $el
			},
			on: {
				slideChange: () => {
					this.setState({ currentSwiper: swiperEl.activeIndex })
				},
				init: () => {
					// if (this.queryData.type == '1') {
					// 	swiperEl.slideTo(1, 200)
					// }
				},
			},
		}
	}
	componentDidMount(): void {
		this.initPage()
	}
	initPage = (): void => {
		console.log(tools.parseUrlSearch(this.props.location.search))
		const queryData = this.queryData
		// 0-new 1-income 2-outcome
		let income: Istate = {
			id: this.incomeCategories[0].id,
			paymentType: this.incomeCategories[0].type,
			moeny: '0',
			category: this.incomeCategories[0].name,
			icon: this.incomeCategories[0].icon,
			time: Date.now(),
		}
		let outcome: Istate = {
			id: this.outcomeCategories[0].id,
			paymentType: this.outcomeCategories[0].type,
			moeny: '0',
			category: this.outcomeCategories[0].name,
			icon: this.outcomeCategories[0].icon,
			time: Date.now(),
		}
		if (queryData.type !== '0') {
			if (queryData.type === '2') {
				outcome = {
					id: queryData.id,
					paymentType: +queryData.paymentType,
					moeny: queryData.moeny,
					category: queryData.category,
					icon: queryData.icon as keyof typeof IconType,
					time: +queryData.time,
				}
			} else {
				income = {
					id: queryData.id,
					paymentType: +queryData.paymentType,
					moeny: queryData.moeny,
					category: queryData.category,
					icon: queryData.icon as keyof typeof IconType,
					time: +queryData.time,
				}
			}
		}
		this.setState({
			income,
			outcome,
			currentSwiper: queryData.type == '1' ? 1 : 0,
		})
		if (this.queryData.type == '1') {
			setTimeout(() => {
				swiperEl.slideTo(1)
			}, 0)
		}
	}
	handleSelected = (slectItem: IconProps): void => {
		const currentType = this.state.currentSwiper === 1 ? 'income' : 'outcome'
		const newData: Istate = JSON.parse(JSON.stringify(this.state[currentType]))
		newData.id = slectItem.id
		newData.category = slectItem.name
		newData.paymentType = slectItem.type
		newData.icon = slectItem.icon
		this.state.currentSwiper === 1 ? this.setState({ income: newData }) : this.setState({ outcome: newData })
	}
	breakCategory = (): void => {
		iconArr.forEach(item => {
			if (item.type === PaymentType.Income) {
				this.incomeCategories.push(item)
			} else {
				this.outcomeCategories.push(item)
			}
		})
	}
	handleEnter = (value: string): void => {
		const currentType = this.state.currentSwiper === 1 ? 'income' : 'outcome'
		let moeny = this.state[currentType].moeny
		if (moeny.length === 0 && value === '.') {
			console.log('你不能输入一个点先')
			return
		}
		const Dot = moeny.match(/\.\d*/)
		// 控制小数点个数，以及小数点后位数（2）
		if (Dot && (value === '.' || Dot[0].length === 3)) {
			console.log('最多输入两位小数')
			return
		}
		if (moeny.length < this.moneyMaxLength) {
			if (moeny === '0') {
				moeny = value
			} else {
				moeny += value
			}
		}
		const newData: Istate = JSON.parse(JSON.stringify(this.state[currentType]))
		newData.moeny = moeny
		this.state.currentSwiper === 1 ? this.setState({ income: newData }) : this.setState({ outcome: newData })
	}
	handleDeleted = (clearFlag = false): void => {
		const currentType = this.state.currentSwiper === 1 ? 'income' : 'outcome'
		let moeny = this.state[currentType].moeny
		const newData: Istate = JSON.parse(JSON.stringify(this.state[currentType]))
		if (clearFlag) {
			newData.moeny = '0'
			this.state.currentSwiper === 1 ? this.setState({ income: newData }) : this.setState({ outcome: newData })
			return
		}
		if (moeny !== '') {
			moeny = moeny.substr(0, moeny.length - 1)
			if (moeny === '') {
				newData.moeny = '0'
			} else {
				newData.moeny = moeny
			}
			this.state.currentSwiper === 1 ? this.setState({ income: newData }) : this.setState({ outcome: newData })
		}
	}
	handleConfirm = (): void => {
		this.props.history.go(-2)
	}
	handleTabChange = (infos: { value: string | number; label: string }): void => {
		console.log(infos)
		if (+infos.value === 1) {
			swiperEl.slideTo(1)
		} else {
			swiperEl.slideTo(0)
		}
	}
	// shouldComponentUpdate(nextProps: RouteComponentProps, nextState: IstateUnite): boolean {
	// 	return nextState.currentSwiper !== this.state.currentSwiper
	// }
	render(): JSX.Element {
		const { income, outcome, currentSwiper } = this.state
		return (
			<div className={style.addAccount}>
				<div className={style.header}>
					<Tab
						current={currentSwiper}
						classes={style.headerTab}
						onChange={(infos: { value: string | number; label: string }) => {
							this.handleTabChange(infos)
						}}>
						<TabItem value={PaymentType.Outcome} label='支出' />
						<TabItem value={PaymentType.Income} label='收入' />
					</Tab>
				</div>
				<Swiper {...this.swiperParams}>
					<section className={style.addDetail}>
						<div style={{ padding: '0 .12rem', backgroundColor: '#fff' }}>
							<AccountItem {...outcome} formatMoney={false} time={undefined} />
						</div>
						<AccountSwiper
							onIconClick={this.handleSelected}
							currentIconId={outcome.id}
							iconArr={this.outcomeCategories}
							ItemClass={style.outcomeActive}
						/>
						<div className={style.addFooter}>
							<div
								style={{
									fontSize: '.28rem',
									lineHeight: '.6rem',
									backgroundColor: '#fefefe',
									textAlign: 'right',
									padding: '.12rem .26rem',
								}}>
								{tools.formatTime(outcome.time, 4)}
							</div>
							<KeyBoard
								okBtnColor='#07C160'
								okFontColor='#fff'
								onEnter={val => {
									this.handleEnter(val)
								}}
								onDelete={this.handleDeleted}
								onClear={() => {
									this.handleDeleted(true)
								}}
								onConfirm={this.handleConfirm}
							/>
						</div>
					</section>
					<section className={style.addDetail}>
						<div style={{ padding: '0 .12rem', backgroundColor: '#fff' }}>
							<AccountItem {...income} formatMoney={false} time={undefined} />
						</div>
						<AccountSwiper
							onIconClick={this.handleSelected}
							currentIconId={income.id}
							iconArr={this.incomeCategories}
							ItemClass={style.incomeActive}
						/>
						<div className={style.addFooter}>
							<div
								style={{
									fontSize: '.28rem',
									lineHeight: '.6rem',
									backgroundColor: '#fefefe',
									textAlign: 'right',
									padding: '.12rem .26rem',
								}}>
								{tools.formatTime(income.time, 4)}
							</div>
							<KeyBoard
								okBtnColor='#ffd31a'
								okFontColor='#fff'
								onEnter={val => {
									this.handleEnter(val)
								}}
								onDelete={this.handleDeleted}
								onClear={() => {
									this.handleDeleted(true)
								}}
								onConfirm={this.handleConfirm}
							/>
						</div>
					</section>
				</Swiper>
			</div>
		)
	}
}

export default Addaccount
