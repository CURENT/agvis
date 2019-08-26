from sys import stdin
import re

def no_Unit(lines):
	for line in lines:
		if 'Unit' in line:
			yield line.replace('Unit', '')
		else:
			yield line


def no_punct(lines):
	for line in lines:
		yield line.replace('(', ' ').replace(')', ' ').replace(',', ' ')


def no_float(lines):
	for line in lines:
		yield re.sub(r'''float ['"]([^'"]+)['"]|float\s+([0-9]+)''', r'\1\2', line)


def no_bool(lines):
	for line in lines:
		yield re.sub(r'''bool ['"]([^'"]+)['"]|bool\s+([0-9]+)''', r'\1\2', line)



def no_int(lines):
	for line in lines:
		yield re.sub(r'''int ['"]([^'"]+)['"]|int\s+([0-9]+)''', r'\1\2', line)


def no_append(lines):
	for line in lines:
		yield line.replace('variables.append', '')


def no_param(lines):
	def replacer(match):
		return str(eval(match.group(1)))
	for line in lines:
		yield re.sub(r'param\[([^\]]+)\]', replacer, line)


def no_idx(lines):
	for line in lines:
		yield re.sub(r'''idx\[([^\]]+)\]''', r'\1', line)


def no_blockquote(lines):
	while True:
		for line in lines:
			if '"""' in line or "'''" in line:
				break
			yield line
		else:
			break

		yield 'description='
		
		for line in lines:
			if '"""' in line or "'''" in line:
				break
			yield '\t' + line
		else:
			break


def kv(key, line):
	value = re.sub(r'''.*%s\s*=\s*([0-9]+|"[^"]+"|'[^']+').*''' % (key,), r'\1', line)
	if value == line:
		return None
	else:
		return value.rstrip()


_g_sect = None


def sect(lines):
	global _g_sect
	for line in lines:
		if 'Sect' in line:
			_g_sect = kv('name', line).replace('"', '').replace("'", '').rstrip()
			yield '[%s]' % (_g_sect,)
		else:
			yield line


def Param(lines):
	for line in lines:
		if 'Param' in line:
			name = kv('name', line)
			value = kv('value', line)
			unit = kv('unit', line)
			yield '[%s.P.%s]' % (_g_sect, value)
			yield 'name=%s' % (name,)
			yield 'unit=%s' % (unit,)
		else:
			yield line


def Variable(lines):
	for line in lines:
		if 'Variable' in line:
			name = kv('name', line)
			abbr = kv('abbr', line)
			index = kv('index', line)
			unit = kv('unit', line)
			maxValue = kv('maxValue', line)
			minValue = kv('minValue', line)
			yield '[%s.V.%s]' % (_g_sect, index)
			yield 'name=%s' % (name,)
			yield 'abbr=%s' % (abbr,)
			yield 'unit=%s' % (unit,)
			if maxValue is not None:
				yield 'max=%s' % (maxValue,)
			if minValue is not None:
				yield 'min=%s' % (minValue,)
		else:
			yield line

def Ref(lines):
	for line in lines:
		if 'Ref' in line:
			key = kv('key', line)
			ref = kv('ref', line)
			value = kv('value', line)
			yield '[%s.R.%s]' % (_g_sect, value)
			yield 'key=%s' % (key,)
			yield 'ref=%s' % (ref,)
		else:
			yield line



def no_quote(lines):
	for line in lines:
		yield line.replace('"', '').replace("'", '')


def no_blank(lines):
	for line in lines:
		if all(c in ' \t\n' for c in line):
			pass
		else:
			yield line.replace('\n', '')


def pretty(lines):
	for line in lines:
		if '[' in line and ']' in line:
			yield ''
			yield line
		else:
			yield line
		


it = stdin
it = no_punct(it)
it = no_param(it)
it = no_idx(it)
it = no_int(it)
it = no_bool(it)
it = no_float(it)
it = no_Unit(it)
it = no_append(it)
it = no_blockquote(it)
it = sect(it)
it = Param(it)
it = Variable(it)
it = Ref(it)
it = no_quote(it)
it = no_blank(it)
it = pretty(it)
for line in it:
	print(line)
