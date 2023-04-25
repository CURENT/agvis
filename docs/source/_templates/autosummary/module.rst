{{ fullname | escape | underline }}

.. automodule:: {{ fullname }}

   {% block attributes %}
   {% if attributes %}
   .. rubric:: {{ _('Attributes') }}

   .. autosummary::
      :toctree: _generated/

      {% for item in attributes %}
      {{ item }}
      {% endfor %}
   {% endif %}
   {% endblock %}

   {% block functions %}
   {% if functions %}
   .. rubric:: {{ _('Functions') }}

   .. autosummary::
      :toctree: _generated/

      {% for item in functions %}
      {{ item }}
      {% endfor %}
   {% endif %}
   {% endblock %}

   {% block classes %}
   {% if classes %}
   .. rubric:: {{ _('Classes') }}

   .. autosummary::
      :toctree: _generated/

      {% for item in classes %}
      {{ item }}
      {% endfor %}
   {% endif %}
   {% endblock %}

   {% block exceptions %}
   {% if exceptions %}
   .. rubric:: {{ _('Exceptions') }}

   .. autosummary::
      :toctree: _generated/

      {% for item in exceptions %}
      {{ item }}
      {% endfor %}
   {% endif %}
   {% endblock %}

{% block modules %}
{% if modules %}
.. rubric:: {{ _('Modules') }}

.. autosummary::
   :recursive:

   {% for item in modules %}
   {{ item }}
