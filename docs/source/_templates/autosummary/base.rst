{{ objname | escape | underline }}

.. currentmodule:: {{ module }}

.. auto{{ objtype }}:: {{ objname }}

   {% block content %}
   {% endblock %}

   {% block methods %}
   {% if objtype == 'class' %}
   .. rubric:: {{ _('Methods') }}

   .. autosummary::
      :toctree: _generated/

      {% for item in methods %}
      {{ objname }}.{{ item }}
      {% endfor %}
   {% endif %}
   {% endblock %}

   {% block attributes %}
   {% if objtype == 'class' %}
   .. rubric:: {{ _('Attributes') }}

   .. autosummary::
      :toctree: _generated/

      {% for item in attributes %}
      {{ objname }}.{{ item }}
      {% endfor %}
   {% endif %}
   {% endblock %}
