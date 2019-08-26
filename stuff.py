Sect name='Bus'
description=
	Describes a Bus object (also called a "node" in the AC transmission
	system). Buses are some of the main objects in the application, that most
	other things go through.

[Bus.P.0]
name=bus number
value=int
unit=id



Param(name='voltage base', value=int(param[1]), unit=Unit('kV')),
Param(name='voltage amplitude initial guess', value=param[2], unit=Unit('p.u.')),
Param(name='voltage phase initial guess', value=param[3], unit=Unit('rad')),
Param(name='area number', value=int(param[4]), unit=Unit('id')),
Param(name='region number', value=int(param[5]), unit=Unit('id')),
Param(name='latitude', value=param[6], unit=Unit('degree')),
Param(name='longitude', value=param[7], unit=Unit('degree')),
variables.append(Variable(name = 'active power injection', abbr='p', index=idx['P'], unit = Unit('p.u.'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name = 'reactive power injection', abbr='q', index=idx['Q'], unit = Unit('p.u.'), maxValue=float("1.0" ),minValue=float("-1.0")))
variables.append(Variable(name = 'voltage magnitude', abbr='v', index=idx['V'], unit = Unit('p.u.'), maxValue=float("1.25" ),minValue=float(".75")))
variables.append(Variable(name = 'voltage angle', abbr='theta', index=idx['theta'], unit = Unit('rad'), maxValue=float("90.0" ),minValue=float("-57.0")))
variables.append(Variable(name = 'bus frequency', abbr='Hz', index=idx['w_Busfreq'], unit = Unit('p.u.'), maxValue=float("1.005" ),minValue=float(".995")))

Sect name='DCLine'
"""
Describes a DCLine object. There are two types of lines: regular power
transmission lines (i.e. what we think of generally as power lines) and
transformers (i.e. the big boxes on a power pole).

To distinguish between the two types of lines, we can look at the "Fixed
Tap Ratio", which will be 1.0 for power lines, otherwise it is a
transformer.

A line connects two buses together, denoted by the ``from bus (i)`` and
``to bus(j)`` parameters.

"""
Param(name='from node (i)', value=int(param[0]), unit=Unit('id')),
Param(name='to node (j)', value=int(param[1]),unit=Unit('id')),
Param(name='type', value=int(param[2]), unit=Unit("?")),
Ref(key='to', ref='node', value=int(param[2-1])),
Ref(key='from', ref='node', value=int(param[1-1])),
variables.append(Variable(name='DC current', abbr='Idc',index=idx['Idc'], unit=Unit('p.u.'), maxValue=float("1" ),minValue=float("0")))

Sect name='Dfig'
Param(name='bus number', value=param[1-1], unit=Unit('int')),
Param(name='wind speed number', value=param[2-1], unit=Unit('int')),
Param(name='sn', value=param[3-1], unit=Unit('float')),
Param(name='vn', value=param[4-1], unit=Unit('float')),
Param(name='fn', value=param[5-1], unit=Unit('int')),
Param(name='rs', value=param[6-1], unit=Unit('float')),
Param(name='xs', value=param[7-1], unit=Unit('float')),
Param(name='rr', value=param[8-1], unit=Unit('float')),
Param(name='xr', value=param[9-1], unit=Unit('float')),
Param(name='xmu', value=param[10-1], unit=Unit('float')),
Param(name='hm', value=param[11-1], unit=Unit('float')),
Param(name='kp', value=param[12-1], unit=Unit('float')),
Param(name='tp', value=param[13-1], unit=Unit('float')),
Param(name='kv', value=param[14-1], unit=Unit('float')),
Param(name='te', value=param[15-1], unit=Unit('float')),
Param(name='r', value=param[16-1], unit=Unit('float')),
Param(name='p', value=param[17-1], unit=Unit('float')),
Param(name='nb', value=param[18-1], unit=Unit('float')),
Param(name='ngb', value=param[19-1], unit=Unit('float')),
Param(name='pmax', value=param[20-1], unit=Unit('float')),
Param(name='pmin', value=param[21-1], unit=Unit('float')),
Param(name='qmax', value=param[22-1], unit=Unit('float')),
Param(name='qmin', value=param[23-1], unit=Unit('float')),
Param(name='connection status', value=param[24-1], unit=Unit('boolean')),
Ref(key='bus', ref='bus', value=int(param[1-1]))
variables.append(Variable(name="rotor speed" , abbr="omega_m" , index=idx["omega_m"], unit=Unit("pu"), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name="pitch angle" , abbr="theta_p", index=idx["theta_p"],unit=Unit("degree"), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name="direct-axis rotor current", abbr="idr" , index=idx["idr"], unit=Unit("pu"), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name= "quadrature-axis rotor current" , abbr="iqr" , index=idx["iqr"] , unit=Unit("pu"), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name='active power output', abbr='p', index=idx['p'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name='reactive power output',abbr='q',  index=idx['q'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("-1")))

Sect name='Exc'
"""
Describes an exciter. There are several types of exciters based on its
"type" parameter.

"""
Ref(key='syn', ref='syn', value=int(param[1-1])),
Param(name='syn number', value=param[1-1], unit=Unit('id')),
Param(name='type', value=param[2-1], unit=Unit('int')),
Param(name='vrmax', value=param[3-1], unit=Unit('float')),
Param(name='vrmin', value=param[4-1], unit=Unit('float')),
Param(name='u0', value=param[5-1], unit=Unit('float')),
Param(name='t1', value=param[6-1], unit=Unit('float')),
Param(name='t2', value=param[7-1], unit=Unit('float')),
Param(name='t3', value=param[8-1], unit=Unit('float')),
Param(name='t4', value=param[9-1], unit=Unit('float')),
Param(name='te', value=param[10-1], unit=Unit('float')),
Param(name='tr', value=param[11-1], unit=Unit('float')),
Param(name='ae', value=param[12-1], unit=Unit('float')),
Param(name='be', value=param[13-1], unit=Unit('float')),
Param(name='connection status', value=param[14-1], unit=Unit('boolean')),
variables.append(Variable(name='excitation voltage',abbr='vf', index=idx['vf'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name='voltage measurement', abbr='vm',index=idx['vm'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("0")))

Sect name='Hvdc'
"""
Describes a high-voltage dc transmission.

"""
Param(name='rectifier bus', value=param[1-1], unit=Unit('id')),
Param(name='inverter bus', value=param[2-1], unit=Unit('id')),
Param(name='sn', value=param[3-1], unit=Unit('float')),
Param(name='vrn', value=param[4-1], unit=Unit('float')),
Param(name='vin', value=param[5-1], unit=Unit('float')),
Param(name='fn', value=param[6-1], unit=Unit('int')),
Param(name='vdcn', value=param[7-1], unit=Unit('float')),
Param(name='idcn', value=param[8-1], unit=Unit('float')),
Param(name='xrt', value=param[9-1], unit=Unit('float')),
Param(name='xit', value=param[10-1], unit=Unit('float')),
Param(name='mr', value=param[11-1], unit=Unit('float')),
Param(name='mi', value=param[12-1], unit=Unit('float')),
Param(name='ki', value=param[13-1], unit=Unit('float')),
Param(name='kp', value=param[14-1], unit=Unit('float')),
Param(name='rdc', value=param[15-1], unit=Unit('float')),
Param(name='ldc', value=param[16-1], unit=Unit('float')),
Param(name='armax', value=param[17-1], unit=Unit('float')),
Param(name='armin', value=param[18-1], unit=Unit('float')),
Param(name='gimax', value=param[19-1], unit=Unit('float')),
Param(name='gimin', value=param[20-1], unit=Unit('float')),
Param(name='yrmax', value=param[21-1], unit=Unit('float')),
Param(name='yrmin', value=param[22-1], unit=Unit('float')),
Param(name='yimax', value=param[23-1], unit=Unit('float')),
Param(name='yimin', value=param[24-1], unit=Unit('float')),
Param(name='control type', value=param[25-1], unit=Unit('int')),
Param(name='iord', value=param[26-1], unit=Unit('float')),
Param(name='pord', value=param[27-1], unit=Unit('float')),
Param(name='vord', value=param[28-1], unit=Unit('float')),
Param(name='connection status', value=param[29-1], unit=Unit('boolean')),
Ref(key='rectifier', ref='bus', value=int(param[1-1])),
Ref(key='inverter', ref='bus', value=int(param[2-1])),
variables.append(Variable(name='dc current',abbr='Idc', index=idx['Idc'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name='rectifier voltage', abbr='Vrdc',index=idx['Vrdc'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name='inverter voltage',abbr='Vidc', index=idx['Vidc'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("0")))

Sect name='Line'
"""
Describes a Line object. There are two types of lines: regular power
transmission lines (i.e. what we think of generally as power lines) and
transformers (i.e. the big boxes on a power pole).

To distinguish between the two types of lines, we can look at the "Fixed
Tap Ratio", which will be 1.0 for power lines, otherwise it is a
transformer.

A line connects two buses together, denoted by the ``from bus (i)`` and
``to bus(j)`` parameters.

"""
Ref(key='from', ref='bus', value=int(param[1-1])),
Ref(key='to', ref='bus', value=int(param[2-1])),
Param(name='from bus (i)', value=int(param[0]), unit=Unit('id')),
Param(name='to bus (j)', value=int(param[1]), unit=Unit('id')),
Param(name='power rating', value=param[2], unit=Unit('MVA')),
Param(name='voltage rating', value=param[3], unit=Unit('kV')),
Param(name='frequency rating', value=param[4], unit=Unit('Hz')),
Param(name='line length', value=param[5], unit=Unit('km')),
Param(name='-not used-', value=param[6], unit=Unit('?')),
Param(name='resistance', value=param[7], unit=Unit('Ohm')/Unit('km')),
Param(name='reactance', value=param[8], unit=Unit('H')/Unit('km')),
Param(name='susceptance', value=param[9], unit=Unit('F')/Unit('km')),
Param(name='-not used-', value=param[10], unit=Unit('?')),
Param(name='-not used-', value=param[11], unit=Unit('?')),
Param(name='current limit', value=param[12], unit=Unit('p.u.')),
Param(name='active power limit', value=param[13], unit=Unit('p.u.')),
Param(name='apparent power limit', value=param[14], unit=Unit('p.u.')),
Param(name='connection status', value=bool(param[15]), unit=Unit('bool')),
variables.append(Variable(name = 'current i-j', abbr='Iij', index=idx['Iij'], unit = Unit('p.u.'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name = 'current j-i', abbr='Iji', index=idx['Iji'], unit = Unit('p.u.'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name = 'active power i-j', abbr='Pij', index=idx['Pij'], unit = Unit('p.u.'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name = 'active power j-i', abbr='Pji', index=idx['Pji'], unit = Unit('rad'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name = 'reactive power i-j', abbr='Qij', index=idx['Qij'], unit = Unit('p.u.'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name = 'reactive power j-i', abbr='Qji', index=idx['Qji'], unit = Unit('p.u.'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name = 'apparent power i-j', abbr='Sij', index=idx['Sij'], unit = Unit('p.u.'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name = 'apparent power j-i', abbr='Sji', index=idx['Sji'], unit = Unit('p.u.'), maxValue=float("1" ),minValue=float("0")))

Sect name='Node'
"""
Describes a Bus object (also called a "node" in the AC transmission
system). Buses are some of the main objects in the application, that most
other things go through.

"""
Param(name='Index', value=int(param[0]), unit=Unit('id')),
Param(name='DC Voltage Rating: vdcn', value=param[1], unit=Unit('kV')),
Param(name='area code', value=int(param[2]), unit=Unit('id')),
Param(name='region code', value=int(param[3]), unit=Unit('id')),
Param(name='latitude', value=param[4], unit=Unit('degree')),
Param(name='longitude', value=param[5], unit=Unit('degree')),
variables.append(Variable(name=' DC voltage magnitude', abbr='v', index=idx['v'], unit=Unit('p.u.'), maxValue=float("1" ),minValue=float("0")))

Sect name='Syn'
"""
Describes a synchronus generator.

"""
Ref(key='bus', ref='bus', value=int(param[1-1])),
Param(name='bus number', value=param[1-1], unit=Unit('float')),
Param(name='sn', value=param[2-1], unit=Unit('float')),
Param(name='vn', value=param[3-1], unit=Unit('float')),
Param(name='fn', value=param[4-1], unit=Unit('int')),
Param(name='model', value=param[5-1], unit=Unit('int')),
Param(name='xl', value=param[6-1], unit=Unit('float')),
Param(name='ra', value=param[7-1], unit=Unit('float')),
Param(name='xd', value=param[8-1], unit=Unit('float')),
Param(name='xd1', value=param[9-1], unit=Unit('float')),
Param(name='xd2', value=param[10-1], unit=Unit('float')),
Param(name='td10', value=param[11-1], unit=Unit('float')),
Param(name='td20', value=param[12-1], unit=Unit('float')),
Param(name='xq', value=param[13-1], unit=Unit('float')),
Param(name='xq1', value=param[14-1], unit=Unit('float')),
Param(name='xq2', value=param[15-1], unit=Unit('float')),
Param(name='tq10', value=param[16-1], unit=Unit('float')),
Param(name='tq20', value=param[17-1], unit=Unit('float')),
Param(name='m', value=param[18-1], unit=Unit('float')),
Param(name='d', value=param[19-1], unit=Unit('float')),
Param(name='kw', value=param[20-1], unit=Unit('float')),
Param(name='kp', value=param[21-1], unit=Unit('float')),
Param(name='gammap', value=param[22-1], unit=Unit('float')),
Param(name='gammaq', value=param[23-1], unit=Unit('float')),
Param(name='taa', value=param[24-1], unit=Unit('float')),
Param(name='s10', value=param[25-1], unit=Unit('float')),
Param(name='s20', value=param[26-1], unit=Unit('float')),
Param(name='ncoi', value=param[27-1], unit=Unit('float')),
Param(name='connection status', value=param[28-1], unit=Unit('boolean')),
variables.append(Variable(name='generator internal angle',abbr='delta', index=idx['delta'], unit=Unit('rad'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name='generator speed',abbr='omega', index=idx['omega'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name='d-axis transient voltage',abbr='e1d', index=idx['e1d'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("0")))
variables.append( Variable(name='q-axis transient voltage',abbr='e1q',  index=idx['e1q'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name='d-axis sub-transient voltage',abbr='e2d',  index=idx['e2d'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name='q-axis sub-transient voltage', abbr='e2q', index=idx['e1q'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name='d-axis flux linkage',abbr='psid',  index=idx['psid'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("1")))
variables.append(Variable(name='q-axis flux linkage',abbr='psiq',  index=idx['psiq'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name='active power output', abbr='p', index=idx['p'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name='reactive power output',abbr='q',  index=idx['q'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("-1")))


Sect name='Tg'
"""
Describes a turbine governor. There are different types of turbine
governers based on the value of the second column, the "type" field.

"""

Ref(key='syn', ref='syn', value=int(param[1-1])),
Param(name='syn number', value=param[1-1], unit=Unit('id')),
Param(name='type', value=param[2-1], unit=Unit('int')),
Param(name='wref0', value=param[3-1], unit=Unit('float')),
Param(name='r', value=param[4-1], unit=Unit('float')),
Param(name='tmax', value=param[5-1], unit=Unit('float')),
Param(name='tmin', value=param[6-1], unit=Unit('float')),
Param(name='ts', value=param[7-1], unit=Unit('float')),
Param(name='tc', value=param[8-1], unit=Unit('float')),
Param(name='t3', value=param[9-1], unit=Unit('float')),
Param(name='t4', value=param[10-1], unit=Unit('float')),
Param(name='t5', value=param[11-1], unit=Unit('float')),
Param(name='connection status', value=param[12-1], unit=Unit('boolean')),
variables.append(Variable(name='mechanical power setpoint',abbr='pm', index=idx['pm'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("0")))
variables.append(Variable(name='speed reference setpoint', abbr='wref',index=idx['wref'], unit=Unit('pu'), maxValue=float("1" ),minValue=float("0")))
